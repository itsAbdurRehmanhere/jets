import hmac
import hashlib
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import EASYPAISA_STORE_ID, EASYPAISA_HASH_KEY, FRONTEND_URL
from app.models.order import Order, PaymentStatus, OrderStatus

router = APIRouter(prefix="/payment", tags=["Payment"])

EASYPAISA_CHECKOUT_URL = "https://easypay.easypaisa.com.pk/tpay/Index.jsf"


def _easypaisa_hash(store_id: str, amount: str, order_ref: str, postback_url: str,
                    tran_type: str, token_expiry: str, hash_key: str) -> str:
    """HMAC-SHA256 signature for EasyPaisa TPay checkout."""
    message = f"{store_id}&{amount}&{postback_url}&{order_ref}&{tran_type}&{token_expiry}"
    return hmac.new(hash_key.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()


@router.post("/easypaisa/initiate/{order_id}")
async def initiate_easypaisa(order_id: int, db: Session = Depends(get_db)):
    """Generate EasyPaisa checkout form parameters for a pending order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not EASYPAISA_STORE_ID or not EASYPAISA_HASH_KEY:
        raise HTTPException(
            status_code=503,
            detail="EasyPaisa is not configured on this server. Please contact support or use COD."
        )

    amount = f"{order.total:.2f}"
    order_ref = order.order_number
    postback_url = f"{FRONTEND_URL}/payment/callback"
    tran_type = "MPAY"
    token_expiry = (datetime.utcnow() + timedelta(hours=1)).strftime("%Y%m%d%H%M%S")

    signature = _easypaisa_hash(
        EASYPAISA_STORE_ID, amount, order_ref, postback_url, tran_type, token_expiry, EASYPAISA_HASH_KEY
    )

    return {
        "checkout_url": EASYPAISA_CHECKOUT_URL,
        "params": {
            "storeId": EASYPAISA_STORE_ID,
            "amount": amount,
            "postBackURL": postback_url,
            "orderRefNum": order_ref,
            "tran_type": tran_type,
            "tokenExpiry": token_expiry,
            "merchantHashedReq": signature,
        },
        "order_id": order.id,
        "order_number": order.order_number,
    }


@router.post("/easypaisa/webhook")
async def easypaisa_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Server-to-server callback from EasyPaisa.
    EasyPaisa POSTs payment result here; we update the order accordingly.
    """
    try:
        form = await request.form()
        order_ref = form.get("orderRefNum") or form.get("orderId", "")
        response_code = form.get("responseCode", "9999")

        order = db.query(Order).filter(Order.order_number == order_ref).first()
        if order:
            if response_code == "0000":
                order.payment_status = PaymentStatus.PAID
                order.order_status = OrderStatus.PROCESSING
                order.payment_id = form.get("pp_TxnRefNo", "")
            else:
                order.payment_status = PaymentStatus.FAILED
            db.commit()

        return {"status": "ok"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/easypaisa/verify")
async def verify_easypaisa_payment(order_number: str, response_code: str, db: Session = Depends(get_db)):
    """
    Called by the frontend after the user is redirected back from EasyPaisa.
    Returns the current order payment status.
    """
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If webhook already updated it, return current status
    if order.payment_status == PaymentStatus.PAID:
        return {"success": True, "order_id": order.id, "payment_status": "paid"}

    # Frontend-reported response code as fallback
    if response_code == "0000":
        order.payment_status = PaymentStatus.PAID
        order.order_status = OrderStatus.PROCESSING
        db.commit()
        return {"success": True, "order_id": order.id, "payment_status": "paid"}

    return {"success": False, "order_id": order.id, "payment_status": order.payment_status}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
import uuid
import string
import random

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin, get_optional_current_user, create_access_token, hash_password
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.schemas.order import (
    OrderCreate, OrderUpdate, OrderResponse, 
    OrderListResponse, OrderItemResponse
)
from app.schemas.cart import CheckoutSchema, GuestCheckoutSchema
from app.core.email import send_order_confirmation_email_async

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

def generate_order_number():
    """Generate unique order number"""
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

def calculate_tax(subtotal: float) -> float:
    """Calculate tax (e.g., 10% tax)"""
    return round(subtotal * 0.10, 2)

def calculate_shipping_cost(subtotal: float) -> float:
    """Calculate shipping cost based on order total"""
    if subtotal >= 100:
        return 0.0  # Free shipping for orders over $100
    return 10.0  # Flat rate $10

def generate_temp_password(length=12):
    """Generate temporary password for guest checkout"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))

def get_or_create_user_for_guest(email: str, customer_name: str, db: Session) -> User:
    """Get user by email or create new guest user"""
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        return user
    
    # Create new guest user with auto-generated username and temp password
    username = email.split('@')[0] + "_" + uuid.uuid4().hex[:6]
    temp_password = generate_temp_password()
    
    new_user = User(
        username=username,
        email=email,
        password=hash_password(temp_password),
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


# ==================== GUEST CHECKOUT ====================

@router.post("/guest-checkout", status_code=status.HTTP_201_CREATED)
async def guest_checkout(
    payload: GuestCheckoutSchema,
    db: Session = Depends(get_db)
):
    """Guest checkout - Creates account if needed and processes order"""
    
    try:
        # Check if user exists by email, if not create guest user
        user = get_or_create_user_for_guest(payload.customer_email, payload.customer_name, db)
        
        # Prepare order items and calculate subtotal
        order_items_data = []
        subtotal = 0.0
        
        for item in payload.items:
            product = db.query(Product).filter(Product.id == item["product_id"]).first()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with id {item['product_id']} not found"
                )
            
            # Check stock
            if product.stock < item["quantity"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.title}. Available: {product.stock}"
                )
            
            item_subtotal = product.price * item["quantity"]
            subtotal += item_subtotal
            
            order_items_data.append({
                "product_id": product.id,
                "product_name": product.title,
                "product_price": product.price,
                "product_image": product.images[0].url if product.images else None,
                "quantity": item["quantity"],
                "subtotal": item_subtotal
            })
        
        if not order_items_data:
            raise HTTPException(status_code=400, detail="No items in order")
        
        # Calculate totals
        tax = calculate_tax(subtotal)
        shipping_cost = calculate_shipping_cost(subtotal)
        total = subtotal + tax + shipping_cost
        
        # Create order
        order = Order(
            user_id=user.id,
            order_number=generate_order_number(),
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            customer_phone=payload.customer_phone,
            shipping_address=payload.shipping_address,
            shipping_city=payload.shipping_city,
            shipping_country="Pakistan",
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            discount=0.0,
            total=total,
            payment_method="pending",
            customer_notes=payload.customer_notes,
            order_status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING
        )
        
        db.add(order)
        db.flush()
        
        # Add order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data["product_id"],
                product_name=item_data["product_name"],
                product_price=item_data["product_price"],
                product_image=item_data["product_image"],
                quantity=item_data["quantity"],
                subtotal=item_data["subtotal"]
            )
            db.add(order_item)
            
            # Update product stock
            product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
            product.stock -= item_data["quantity"]
        
        db.commit()
        db.refresh(order)
        
        # Create access token for auto-login
        token_data = {
            "user_id": user.id,
            "is_admin": user.is_admin,
            "username": user.username
        }
        access_token = create_access_token(token_data)
        
        # Send confirmation email if requested
        if payload.send_confirmation_email:
            await send_order_confirmation_email_async(
                recipient_email=payload.customer_email,
                customer_name=payload.customer_name,
                order_number=order.order_number,
                order_items=order_items_data,
                subtotal=subtotal,
                tax=tax,
                shipping_cost=shipping_cost,
                total=total,
                shipping_address=payload.shipping_address,
                shipping_city=payload.shipping_city
            )
        
        return {
            "message": "Order created successfully - You are now logged in!",
            "order": {
                "order_id": order.id,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "shipping_address": order.shipping_address,
                "shipping_city": order.shipping_city,
                "subtotal": order.subtotal,
                "tax": order.tax,
                "shipping_cost": order.shipping_cost,
                "total": order.total,
                "order_status": order.order_status,
                "created_at": order.created_at
            },
            "items_count": len(order_items_data),
            "email_sent": payload.send_confirmation_email,
            "user": {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin
            },
            "access_token": access_token,
            "token_type": "bearer",
            "note": "Save this access token to stay logged in on your next visit"
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== CHECKOUT ====================

@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def checkout(
    payload: CheckoutSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Checkout: Create order from cart for authenticated users"""
    
    try:
        # Get user
        user = db.query(User).filter(User.id == current_user["user_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's cart
        cart = db.query(Cart).filter(Cart.user_id == current_user["user_id"]).first()
        if not cart:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Get cart items
        cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Prepare order items and calculate subtotal
        order_items_data = []
        subtotal = 0.0
        
        for cart_item in cart_items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with id {cart_item.product_id} not found"
                )
            
            # Check stock
            if product.stock < cart_item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.title}. Available: {product.stock}"
                )
            
            item_subtotal = product.price * cart_item.quantity
            subtotal += item_subtotal
            
            order_items_data.append({
                "product_id": product.id,
                "product_name": product.title,
                "product_price": product.price,
                "product_image": product.images[0].url if product.images else None,
                "quantity": cart_item.quantity,
                "subtotal": item_subtotal
            })
        
        # Calculate totals
        tax = calculate_tax(subtotal)
        shipping_cost = calculate_shipping_cost(subtotal)
        total = subtotal + tax + shipping_cost
        
        # Create order
        order = Order(
            user_id=current_user["user_id"],
            order_number=generate_order_number(),
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            customer_phone=payload.customer_phone,
            shipping_address=payload.shipping_address,
            shipping_city=payload.shipping_city,
            shipping_country="Pakistan",
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            discount=0.0,
            total=total,
            payment_method=payload.payment_method,
            customer_notes=payload.customer_notes,
            order_status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING
        )
        
        db.add(order)
        db.flush()
        
        # Add order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data["product_id"],
                product_name=item_data["product_name"],
                product_price=item_data["product_price"],
                product_image=item_data["product_image"],
                quantity=item_data["quantity"],
                subtotal=item_data["subtotal"]
            )
            db.add(order_item)
            
            # Update product stock
            product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
            product.stock -= item_data["quantity"]
        
        db.commit()
        db.refresh(order)
        
        # Send confirmation email if requested
        if payload.send_confirmation_email:
            await send_order_confirmation_email_async(
                recipient_email=payload.customer_email,
                customer_name=payload.customer_name,
                order_number=order.order_number,
                order_items=order_items_data,
                subtotal=subtotal,
                tax=tax,
                shipping_cost=shipping_cost,
                total=total,
                shipping_address=payload.shipping_address,
                shipping_city=payload.shipping_city
            )
        
        # Clear cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        
        response_data: dict = {
            "message": "Order created successfully",
            "order": {
                "order_id": order.id,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "shipping_address": order.shipping_address,
                "shipping_city": order.shipping_city,
                "subtotal": order.subtotal,
                "tax": order.tax,
                "shipping_cost": order.shipping_cost,
                "total": order.total,
                "order_status": order.order_status,
                "payment_method": order.payment_method,
                "created_at": order.created_at
            },
            "items_count": len(order_items_data),
            "email_sent": payload.send_confirmation_email
        }

        # If EasyPaisa, generate payment form parameters
        if payload.payment_method == "easypaisa":
            import hmac as _hmac
            import hashlib as _hashlib
            from datetime import timedelta as _td
            from app.core.config import EASYPAISA_STORE_ID, EASYPAISA_HASH_KEY, FRONTEND_URL

            if EASYPAISA_STORE_ID and EASYPAISA_HASH_KEY:
                amount_str = f"{order.total:.2f}"
                postback = f"{FRONTEND_URL}/payment/callback"
                tran_type = "MPAY"
                token_expiry = (datetime.now() + _td(hours=1)).strftime("%Y%m%d%H%M%S")
                msg = f"{EASYPAISA_STORE_ID}&{amount_str}&{postback}&{order.order_number}&{tran_type}&{token_expiry}"
                sig = _hmac.new(EASYPAISA_HASH_KEY.encode(), msg.encode(), _hashlib.sha256).hexdigest()
                response_data["easypaisa"] = {
                    "checkout_url": "https://easypay.easypaisa.com.pk/tpay/Index.jsf",
                    "params": {
                        "storeId": EASYPAISA_STORE_ID,
                        "amount": amount_str,
                        "postBackURL": postback,
                        "orderRefNum": order.order_number,
                        "tran_type": tran_type,
                        "tokenExpiry": token_expiry,
                        "merchantHashedReq": sig,
                    }
                }

        return response_data

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== CREATE ORDER ====================

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new order"""
    
    # Get user details
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate order amounts (simplified - in real app, get from cart)
    # For now, we'll assume products are passed in a separate endpoint
    # This is a placeholder - you'll need to implement cart functionality
    
    subtotal = 0.0
    order_items = []
    
    # Note: In a real application, you would get items from a cart
    # This is a simplified example
    
    tax = calculate_tax(subtotal)
    shipping_cost = calculate_shipping_cost(subtotal)
    discount = 0.0
    total = subtotal + tax + shipping_cost - discount
    
    # Create order
    order = Order(
        user_id=current_user["user_id"],
        order_number=generate_order_number(),
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        shipping_address=payload.shipping_address,
        shipping_city=payload.shipping_city,
        shipping_state=payload.shipping_state,
        shipping_country=payload.shipping_country,
        shipping_zipcode=payload.shipping_zipcode,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        discount=discount,
        total=total,
        payment_method=payload.payment_method,
        customer_notes=payload.customer_notes
    )
    
    db.add(order)
    db.flush()  # Get order ID without committing
    
    # Add order items (you'll need to implement this based on your cart)
    # for item in cart_items:
    #     order_item = OrderItem(
    #         order_id=order.id,
    #         product_id=item.product_id,
    #         product_name=item.product.name,
    #         product_price=item.product.price,
    #         product_image=item.product.images[0].url if item.product.images else None,
    #         quantity=item.quantity,
    #         subtotal=item.product.price * item.quantity
    #     )
    #     db.add(order_item)
    
    db.commit()
    db.refresh(order)
    
    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "shipping_address": order.shipping_address,
        "shipping_city": order.shipping_city,
        "shipping_country": order.shipping_country,
        "total": order.total,
        "order_status": order.order_status,
        "created_at": order.created_at,
        "payment_note": "Please contact us on WhatsApp to complete your payment",
        "whatsapp_number": "+12345678900",
        "whatsapp_link": "https://wa.me/12345678900"
    }


# ==================== ADD ITEM TO ORDER ====================

@router.post("/{order_id}/items")
async def add_order_item(
    order_id: int,
    product_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add an item to existing order"""
    
    # Check if order exists and belongs to user
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user["user_id"]
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order can be modified (only pending orders)
    if order.order_status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot add items to order with status: {order.order_status}"
        )
    
    # Check if product exists and has stock
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {product.stock}"
        )
    
    # Check if item already exists in order
    existing_item = db.query(OrderItem).filter(
        OrderItem.order_id == order_id,
        OrderItem.product_id == product_id
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += quantity
        existing_item.subtotal = existing_item.product_price * existing_item.quantity
        db.commit()
        db.refresh(existing_item)
        order_item = existing_item
    else:
        # Get primary image for product if exists
        from app.models.product_image import ProductImage
        product_image = db.query(ProductImage).filter(
            ProductImage.product_id == product_id,
            ProductImage.is_primary == True
        ).first()
        
        # Create new order item
        order_item = OrderItem(
            order_id=order_id,
            product_id=product_id,
            product_name=product.title,
            product_price=product.price,
            product_image=product_image.url if product_image else None,
            quantity=quantity,
            subtotal=product.price * quantity
        )
        db.add(order_item)
    
    # Update order totals
    # Recalculate subtotal from all items (including the new one)
    all_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    # Add the current item if it's new (not yet committed)
    if not existing_item:
        all_items.append(order_item)
    
    order.subtotal = sum(item.subtotal for item in all_items)
    order.tax = calculate_tax(order.subtotal)
    order.shipping_cost = calculate_shipping_cost(order.subtotal)
    order.total = order.subtotal + order.tax + order.shipping_cost - order.discount
    
    db.commit()
    db.refresh(order)
    
    return {
        "message": "Item added to order successfully",
        "order": {
            "order_id": order.id,
            "order_number": order.order_number,
            "subtotal": order.subtotal,
            "tax": order.tax,
            "shipping_cost": order.shipping_cost,
            "total": order.total
        },
        "item": order_item,
        "payment_note": "Please contact us on WhatsApp to complete your payment",
        "whatsapp_number": "+12345678900",
        "whatsapp_link": "https://wa.me/12345678900"
    }


# ==================== GET ORDERS ====================

@router.get("/")
async def get_my_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's orders"""
    
    query = db.query(Order).filter(Order.user_id == current_user["user_id"])
    
    if status:
        query = query.filter(Order.order_status == status)
    
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Prepare response with item count
    result = []
    for order in orders:
        items_count = db.query(OrderItem).filter(OrderItem.order_id == order.id).count()
        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "customer_name": order.customer_name,
            "total": order.total,
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "created_at": order.created_at,
            "items_count": items_count
        })
    
    return {
        "data": result,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/admin/all")
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[OrderStatus] = None,
    order_number: Optional[str] = None,
    customer_email: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Admin: Get all orders with optional filters"""

    query = db.query(Order)

    if status:
        query = query.filter(Order.order_status == status)

    if order_number:
        query = query.filter(Order.order_number.ilike(f"%{order_number}%"))

    if customer_email:
        query = query.filter(Order.customer_email.ilike(f"%{customer_email}%"))

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "data": orders,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{order_id}")
async def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get order details by ID"""
    
    # Check if user has access to this order
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Allow access if user is admin or order belongs to the user
    if not current_user["is_admin"] and order.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view this order"
        )
    
    # Get order items
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    return {
        "order": order,
        "items": items,
        "items_count": len(items)
    }


# ==================== UPDATE ORDER ====================

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_update: OrderUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Admin: Update order status"""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update fields
    if status_update.order_status:
        order.order_status = status_update.order_status
        
        # Set timestamps based on status
        if status_update.order_status == OrderStatus.DELIVERED:
            order.delivered_at = datetime.utcnow()
        elif status_update.order_status == OrderStatus.CANCELLED:
            order.cancelled_at = datetime.utcnow()
    
    if status_update.payment_status:
        order.payment_status = status_update.payment_status
    
    if status_update.tracking_number:
        order.tracking_number = status_update.tracking_number
    
    if status_update.tracking_company:
        order.tracking_company = status_update.tracking_company
    
    if status_update.admin_notes:
        order.admin_notes = status_update.admin_notes
    
    db.commit()
    db.refresh(order)
    
    return {
        "message": "Order updated successfully",
        "data": order
    }


@router.delete("/{order_id}")
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Cancel an order (only pending orders)"""
    
    # Check if order exists and belongs to user
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user["user_id"]
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order can be cancelled
    if order.order_status not in [OrderStatus.PENDING, OrderStatus.PROCESSING]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order with status: {order.order_status}"
        )
    
    # Get all order items before cancelling
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    cancelled_items_count = len(order_items)

    # Restore stock for each product
    for item in order_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity

    # Delete all order items (cascade will handle this)
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()

    # Update order status
    order.order_status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Order cancelled successfully",
        "order_id": order_id,
        "status": order.order_status,
        "cancelled_items_count": cancelled_items_count,
        "cancelled_items": [{
            "product_name": item.product_name,
            "quantity": item.quantity,
            "subtotal": item.subtotal
        } for item in order_items]
    }


@router.delete("/admin/{order_id}")
async def admin_delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Admin: Delete an order (admin only)"""
    
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get all order items before deleting
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    deleted_items_count = len(order_items)
    
    # Delete all order items (cascade will handle this)
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()
    
    # Delete the order
    db.delete(order)
    db.commit()
    
    return {
        "message": "Order deleted successfully",
        "order_id": order_id,
        "deleted_items_count": deleted_items_count,
        "deleted_items": [{
            "product_name": item.product_name,
            "quantity": item.quantity,
            "subtotal": item.subtotal
        } for item in order_items]
    }
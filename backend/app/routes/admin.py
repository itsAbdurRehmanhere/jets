from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

LOW_STOCK_THRESHOLD = 5


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Admin dashboard — orders, revenue, users, product stats"""

    # Order counts by status
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.order_status == OrderStatus.PENDING).count()
    processing_orders = db.query(Order).filter(Order.order_status == OrderStatus.PROCESSING).count()
    shipped_orders = db.query(Order).filter(Order.order_status == OrderStatus.SHIPPED).count()
    delivered_orders = db.query(Order).filter(Order.order_status == OrderStatus.DELIVERED).count()
    cancelled_orders = db.query(Order).filter(Order.order_status == OrderStatus.CANCELLED).count()

    # Revenue
    total_revenue = db.query(func.sum(Order.total)).filter(
        Order.payment_status == PaymentStatus.PAID
    ).scalar() or 0.0

    pending_revenue = db.query(func.sum(Order.total)).filter(
        Order.order_status != OrderStatus.CANCELLED
    ).scalar() or 0.0

    # Users
    total_users = db.query(User).filter(User.is_admin == False).count()

    # Products
    total_products = db.query(Product).count()
    out_of_stock = db.query(Product).filter(Product.stock == 0).count()
    low_stock = db.query(Product).filter(
        Product.stock > 0,
        Product.stock <= LOW_STOCK_THRESHOLD
    ).count()

    # Top 5 selling products
    top_products = (
        db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("total_revenue")
        )
        .group_by(OrderItem.product_id, OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    # Low stock products list
    low_stock_products = (
        db.query(Product)
        .filter(Product.stock <= LOW_STOCK_THRESHOLD)
        .order_by(Product.stock.asc())
        .limit(10)
        .all()
    )

    # Recent 5 orders
    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "processing": processing_orders,
            "shipped": shipped_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders
        },
        "revenue": {
            "total_paid": round(total_revenue, 2),
            "pending_collection": round(pending_revenue, 2)
        },
        "users": {
            "total_customers": total_users
        },
        "products": {
            "total": total_products,
            "out_of_stock": out_of_stock,
            "low_stock": low_stock
        },
        "top_selling_products": [
            {
                "product_id": p.product_id,
                "product_name": p.product_name,
                "total_sold": int(p.total_sold),
                "total_revenue": round(float(p.total_revenue), 2)
            }
            for p in top_products
        ],
        "low_stock_alerts": [
            {
                "product_id": p.id,
                "title": p.title,
                "stock": p.stock,
                "size": p.size
            }
            for p in low_stock_products
        ],
        "recent_orders": [
            {
                "order_id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "total": o.total,
                "order_status": o.order_status,
                "payment_status": o.payment_status,
                "created_at": o.created_at
            }
            for o in recent_orders
        ]
    }


# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    search: str = "",
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """List all registered users."""
    q = db.query(User)
    if search:
        q = q.filter(
            User.email.ilike(f"%{search}%") | User.username.ilike(f"%{search}%")
        )
    total = q.count()
    users = q.order_by(User.id.desc()).offset(skip).limit(limit).all()
    return {
        "data": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "is_admin": u.is_admin,
                "phone": u.phone,
                "city": u.city,
                "order_count": db.query(Order).filter(Order.user_id == u.id).count(),
            }
            for u in users
        ],
        "total": total,
    }


@router.put("/users/{user_id}/toggle-admin")
async def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Promote or demote a user's admin status."""
    if user_id == admin["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    return {"id": user.id, "is_admin": user.is_admin, "message": f"{'Promoted to' if user.is_admin else 'Removed from'} admin"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Delete a user account (and cascade their data)."""
    if user_id == admin["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

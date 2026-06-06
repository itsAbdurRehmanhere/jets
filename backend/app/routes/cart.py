from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_optional_current_user, get_current_user
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

def get_or_create_cart(user_id: int, db: Session) -> Cart:
    """Get or create a cart for the user"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Add item to cart (works for both authenticated and guest users)"""
    try:
        # If no user is authenticated, we need a user_id for the cart
        # For guests, we can use a temporary ID or ask them to provide email later
        if not current_user:
            # Return message asking user to checkout to proceed
            # Cart will be stored in browser localStorage for now
            raise HTTPException(
                status_code=401,
                detail="Please proceed to checkout to continue. Guest checkout is available."
            )
        
        # Get or create cart
        cart = get_or_create_cart(current_user["user_id"], db)
        
        # Check if product exists
        product = db.query(Product).filter(Product.id == payload.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {payload.product_id} not found"
            )
        
        # Check if product is in stock
        if product.stock < payload.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {product.stock}"
            )
        
        # Check if item already in cart
        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == payload.product_id
        ).first()
        
        if cart_item:
            # Update quantity if item exists
            new_quantity = cart_item.quantity + payload.quantity
            if product.stock < new_quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock. Available: {product.stock}"
                )
            cart_item.quantity = new_quantity
        else:
            # Add new item to cart
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=payload.product_id,
                quantity=payload.quantity
            )
            db.add(cart_item)
        
        db.commit()
        
        return {
            "message": "Item added to cart successfully",
            "product_id": payload.product_id,
            "quantity": payload.quantity
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/")
async def get_cart(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user's cart"""
    try:
        cart = get_or_create_cart(current_user["user_id"], db)
        
        # Get cart items with product details
        items = []
        total_price = 0.0
        
        for cart_item in cart.items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).first()
            if product:
                item_subtotal = product.price * cart_item.quantity
                total_price += item_subtotal
                
                items.append({
                    "id": cart_item.id,
                    "product_id": cart_item.product_id,
                    "product_name": product.title,
                    "product_price": product.price,
                    "quantity": cart_item.quantity,
                    "subtotal": item_subtotal,
                    "product_image": product.images[0].url if product.images else None
                })
        
        return {
            "cart_id": cart.id,
            "user_id": cart.user_id,
            "items": items,
            "total_items": len(items),
            "total_price": round(total_price, 2)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/items/{cart_item_id}")
async def update_cart_item(
    cart_item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update quantity of item in cart"""
    try:
        # Get cart item
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        if not cart_item:
            raise HTTPException(
                status_code=404,
                detail="Cart item not found"
            )
        
        # Verify cart belongs to user
        cart = db.query(Cart).filter(Cart.id == cart_item.cart_id).first()
        if cart.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to modify this cart"
            )
        
        # Check product stock
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )
        
        if product.stock < payload.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {product.stock}"
            )
        
        cart_item.quantity = payload.quantity
        db.commit()
        
        return {
            "message": "Cart item updated successfully",
            "product_id": cart_item.product_id,
            "quantity": payload.quantity
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/items/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Remove item from cart"""
    try:
        # Get cart item
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        if not cart_item:
            raise HTTPException(
                status_code=404,
                detail="Cart item not found"
            )
        
        # Verify cart belongs to user
        cart = db.query(Cart).filter(Cart.id == cart_item.cart_id).first()
        if cart.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to modify this cart"
            )
        
        db.delete(cart_item)
        db.commit()
        
        return {
            "message": "Item removed from cart successfully",
            "product_id": cart_item.product_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/")
async def clear_cart(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Clear all items from cart"""
    try:
        cart = get_or_create_cart(current_user["user_id"], db)
        
        # Delete all cart items
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        
        return {"message": "Cart cleared successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

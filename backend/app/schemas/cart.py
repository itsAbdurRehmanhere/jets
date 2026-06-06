from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1, le=999)
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=999)
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[dict] = None  # Will be populated with product details
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    total_items: int = 0
    
    class Config:
        from_attributes = True

class CustomerInfoSchema(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=200)
    customer_email: str = Field(..., max_length=200)
    customer_phone: str = Field(..., min_length=10, max_length=20)
    shipping_address: str = Field(..., min_length=5)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    customer_notes: Optional[str] = None
    
    @validator('customer_email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email address')
        return v

class CheckoutSchema(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=200)
    customer_email: str = Field(..., max_length=200)
    customer_phone: str = Field(..., min_length=10, max_length=20)
    shipping_address: str = Field(..., min_length=5)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    customer_notes: Optional[str] = None
    send_confirmation_email: bool = True
    
    @validator('customer_email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email address')
        return v

class GuestCheckoutSchema(BaseModel):
    """Schema for guest checkout - creates account if needed"""
    customer_name: str = Field(..., min_length=2, max_length=200)
    customer_email: str = Field(..., max_length=200)
    customer_phone: str = Field(..., min_length=10, max_length=20)
    shipping_address: str = Field(..., min_length=5)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    customer_notes: Optional[str] = None
    send_confirmation_email: bool = True
    # Guest checkout items (since cart might be in browser)
    items: List[dict] = Field(...)  # [{"product_id": int, "quantity": int}]
    
    @validator('customer_email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email address')
        return v

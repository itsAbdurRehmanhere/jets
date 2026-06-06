# app/schemas/order.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OrderStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1, le=999)
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=200)
    customer_email: str = Field(..., max_length=200)
    customer_phone: Optional[str] = Field(None, max_length=20)
    shipping_address: str = Field(..., min_length=5)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    shipping_state: Optional[str] = Field(None, max_length=100)
    shipping_country: str = Field(..., min_length=2, max_length=100)
    shipping_zipcode: Optional[str] = Field(None, max_length=20)
    payment_method: str = Field(..., pattern="^(credit_card|paypal|cash_on_delivery)$")
    customer_notes: Optional[str] = None
    
    @validator('customer_email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email address')
        return v

class OrderUpdate(BaseModel):
    order_status: Optional[OrderStatusEnum] = None
    payment_status: Optional[PaymentStatusEnum] = None
    tracking_number: Optional[str] = None
    tracking_company: Optional[str] = None
    admin_notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    product_image: Optional[str]
    quantity: int
    subtotal: float
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    shipping_address: str
    shipping_city: str
    shipping_state: Optional[str]
    shipping_country: str
    shipping_zipcode: Optional[str]
    subtotal: float
    tax: float
    shipping_cost: float
    discount: float
    total: float
    order_status: OrderStatusEnum
    payment_status: PaymentStatusEnum
    payment_method: Optional[str]
    tracking_number: Optional[str]
    tracking_company: Optional[str]
    customer_notes: Optional[str]
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    total: float
    order_status: OrderStatusEnum
    payment_status: PaymentStatusEnum
    created_at: datetime
    items_count: int
    
    class Config:
        from_attributes = True
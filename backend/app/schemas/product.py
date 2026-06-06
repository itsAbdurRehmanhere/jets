from pydantic import BaseModel, Field
from typing import Optional

class ProductCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category_id: Optional[int] = None
    product_type_id: Optional[int] = None  # e.g., "Fighter Jets", "Commercial Jets"
    size: Optional[str] = Field(None, max_length=50, description="Size in inches, e.g., '12.5', '15.3'")

class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    product_type_id: Optional[int] = None
    size: Optional[str] = Field(None, max_length=50, description="Size in inches, e.g., '12.5', '15.3'")

class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    stock: int
    category_id: Optional[int]
    product_type_id: Optional[int]
    size: Optional[str]  # Size in inches
    
    class Config:
        from_attributes = True
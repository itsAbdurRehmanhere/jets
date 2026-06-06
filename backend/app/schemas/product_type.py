from pydantic import BaseModel, Field
from typing import Optional

class ProductTypeBase(BaseModel):
    name: str  # e.g., "Fighter Jets", "Commercial Jets"
    description: Optional[str] = None

class ProductTypeCreate(ProductTypeBase):
    category_id: int

class ProductTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProductTypeResponse(ProductTypeBase):
    id: int
    category_id: int
    
    class Config:
        from_attributes = True

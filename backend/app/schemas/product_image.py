# app/schemas/product_image.py (Add to existing file)
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# ==================== BASE SCHEMAS ====================

class ProductImageBase(BaseModel):
    """Base schema for product image"""
    product_id: int
    is_primary: bool = False
    display_order: int = 0

# ==================== CREATE SCHEMAS ====================

class ProductImageCreate(BaseModel):
    """Schema for creating a product image"""
    product_id: int
    is_primary: bool = False
    display_order: int = 0
    
    class Config:
        from_attributes = True

class ProductImageUploadResponse(BaseModel):
    """Response after uploading images"""
    id: int
    filename: str
    url: str
    is_primary: bool
    display_order: int
    file_size: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== RESPONSE SCHEMAS ====================

class ProductImageResponse(BaseModel):
    """Schema for product image response"""
    id: int
    product_id: int
    filename: str
    url: str
    is_primary: bool
    display_order: int
    file_size: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductImageListResponse(BaseModel):
    """Schema for list of product images response"""
    product_id: int
    product_title: str
    total_images: int
    skip: int = 0
    limit: int = 100
    images: List[ProductImageResponse]

# ==================== UPDATE SCHEMAS ====================

class ProductImageUpdate(BaseModel):
    """Schema for updating product image"""
    is_primary: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0, le=100)
    
    @validator('display_order')
    def validate_display_order(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Display order must be between 0 and 100')
        return v

class ProductImageBulkUpdate(BaseModel):
    """Schema for bulk updating image display orders"""
    image_orders: List[int] = Field(..., description="List of image IDs in desired order")

# ==================== DELETE SCHEMAS ====================

class ProductImageDeleteResponse(BaseModel):
    """Schema for delete image response"""
    message: str
    deleted_image_id: int
    deleted_file: Optional[str] = None

class ProductImageBulkDeleteResponse(BaseModel):
    """Schema for bulk delete response"""
    message: str
    product_id: int
    product_title: str
    deleted_count: int
    deleted_files: List[str] = []

# ==================== STATS SCHEMAS ====================

class UploadStatsResponse(BaseModel):
    """Schema for upload statistics"""
    total_images: int
    total_size_mb: float
    products_with_images: int
    storage_path: str
    recent_uploads: List[ProductImageResponse]

# ==================== ERROR SCHEMAS ====================

class UploadError(BaseModel):
    """Schema for upload error"""
    filename: str
    error: str

class UploadResponse(BaseModel):
    """Schema for multi-upload response"""
    message: str
    product_id: int
    product_title: str
    saved_to: str
    total_uploaded: int
    images: List[ProductImageResponse]
    errors: Optional[List[UploadError]] = None

class SingleUploadResponse(BaseModel):
    """Schema for single upload response"""
    message: str
    product_id: int
    product_title: str
    image: ProductImageResponse
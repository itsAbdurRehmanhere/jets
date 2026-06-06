from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.product_type import ProductType
from app.models.category import Category
from app.schemas.product_type import ProductTypeCreate, ProductTypeUpdate, ProductTypeResponse

router = APIRouter(
    prefix="/product-types",
    tags=["Product Types"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product_type(
    payload: ProductTypeCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Create a new product type (e.g., Fighter Jets, Commercial Jets within a category)"""
    
    # Check if category exists
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail=f"Category with id {payload.category_id} not found"
        )
    
    # Check if type already exists in this category
    existing_type = db.query(ProductType).filter(
        ProductType.category_id == payload.category_id,
        ProductType.name == payload.name
    ).first()
    
    if existing_type:
        raise HTTPException(
            status_code=400,
            detail=f"Product type '{payload.name}' already exists in this category"
        )
    
    product_type = ProductType(
        category_id=payload.category_id,
        name=payload.name,
        description=payload.description
    )
    
    db.add(product_type)
    db.commit()
    db.refresh(product_type)
    
    return {
        "message": "Product type created successfully",
        "data": ProductTypeResponse.model_validate(product_type)
    }

@router.get("/category/{category_id}")
async def get_product_types_by_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Get all product types (e.g., jet models) within a specific category"""
    
    # Check if category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail=f"Category with id {category_id} not found"
        )
    
    product_types = db.query(ProductType).filter(
        ProductType.category_id == category_id
    ).all()
    
    return {
        "category_id": category_id,
        "category_name": category.name,
        "product_types": [ProductTypeResponse.model_validate(pt) for pt in product_types],
        "total": len(product_types)
    }

@router.get("/{type_id}")
async def get_product_type(
    type_id: int,
    db: Session = Depends(get_db)
):
    """Get a single product type"""
    
    product_type = db.query(ProductType).filter(ProductType.id == type_id).first()
    
    if not product_type:
        raise HTTPException(
            status_code=404,
            detail=f"Product type with id {type_id} not found"
        )
    
    return ProductTypeResponse.model_validate(product_type)

@router.put("/{type_id}")
async def update_product_type(
    type_id: int,
    payload: ProductTypeUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Update a product type"""
    
    product_type = db.query(ProductType).filter(ProductType.id == type_id).first()
    
    if not product_type:
        raise HTTPException(
            status_code=404,
            detail=f"Product type with id {type_id} not found"
        )
    
    if payload.name:
        product_type.name = payload.name
    
    if payload.description is not None:
        product_type.description = payload.description
    
    db.commit()
    db.refresh(product_type)
    
    return {
        "message": "Product type updated successfully",
        "data": ProductTypeResponse.model_validate(product_type)
    }

@router.delete("/{type_id}")
async def delete_product_type(
    type_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Delete a product type"""
    
    product_type = db.query(ProductType).filter(ProductType.id == type_id).first()
    
    if not product_type:
        raise HTTPException(
            status_code=404,
            detail=f"Product type with id {type_id} not found"
        )
    
    db.delete(product_type)
    db.commit()
    
    return {
        "message": "Product type deleted successfully",
        "id": type_id
    }

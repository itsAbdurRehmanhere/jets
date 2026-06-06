from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.security import get_current_admin, get_current_user
from app.core.database import get_db
from app.models.product import Product
from app.models.product_type import ProductType
from app.models.product_image import ProductImage
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.category import Category


router = APIRouter(
    prefix="/products",
    tags= ["Products"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db:Session = Depends(get_db),
    is_admin: dict = Depends(get_current_admin)  # Admin only
):
    """Create a new product. Size should be in inches if provided."""
    if payload.category_id:
        category = db.query(Category).filter(Category.id == payload.category_id).first()
        if not category:
            raise HTTPException(
                status_code=404,
                detail=f"Category with id {payload.category_id} does not exist"
            )
    
    if payload.product_type_id:
        product_type = db.query(ProductType).filter(ProductType.id == payload.product_type_id).first()
        if not product_type:
            raise HTTPException(
                status_code=404,
                detail=f"Product type with id {payload.product_type_id} does not exist"
            )
    
    product = Product(
        title=payload.title,
        description=payload.description,
        price=payload.price,
        stock=payload.stock,
        category_id=payload.category_id,
        product_type_id=payload.product_type_id,
        size=payload.size
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return {
        "message": "Product created successfully",
        "data": product
    }
    
@router.get("/")
async def get_products(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    product_type_id: Optional[int] = None,
    size: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get products with pagination, filtering and search"""
    query = db.query(Product).options(joinedload(Product.images))

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if product_type_id:
        query = query.filter(Product.product_type_id == product_type_id)

    if size:
        query = query.filter(Product.size.ilike(f"%{size}%"))

    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

    # Get total count before applying limit
    total = query.count()

    # Apply pagination
    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

    def serialize_product(p):
        return {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "price": p.price,
            "stock": p.stock,
            "size": p.size,
            "category_id": p.category_id,
            "product_type_id": p.product_type_id,
            "created_at": p.created_at,
            "images": [
                {"id": img.id, "url": img.url, "is_primary": img.is_primary, "display_order": img.display_order}
                for img in sorted(p.images, key=lambda x: x.display_order)
            ]
        }

    return {
        "data": [serialize_product(p) for p in products],
        "total": total,
        "skip": skip,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0,
        "current_page": (skip // limit) + 1 if total > 0 else 1
    }
    
@router.get("/category/{category_id}")
async def get_products_by_category(
    category_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Check if category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail=f"Category with id {category_id} does not exist"
        )
    
    # Get products in this category
    products = db.query(Product).filter(
        Product.category_id == category_id
    ).offset(skip).limit(limit).all()
    
    total = db.query(Product).filter(Product.category_id == category_id).count()
    
    return {
        "category": {
            "id": category.id,
            "name": category.name,
            "description": category.description
        },
        "products": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/type/{product_type_id}")
async def get_products_by_type(
    product_type_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Check if product type exists
    product_type = db.query(ProductType).filter(ProductType.id == product_type_id).first()
    if not product_type:
        raise HTTPException(
            status_code=404,
            detail=f"Product type with id {product_type_id} does not exist"
        )
    
    # Get products of this type
    products = db.query(Product).filter(
        Product.product_type_id == product_type_id
    ).offset(skip).limit(limit).all()
    
    total = db.query(Product).filter(Product.product_type_id == product_type_id).count()
    
    return {
        "product_type": {
            "id": product_type.id,
            "name": product_type.name,
            "description": product_type.description,
            "category_id": product_type.category_id
        },
        "products": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{product_id}")
async def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).options(joinedload(Product.images)).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )

    return {
        "data": {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "size": product.size,
            "category_id": product.category_id,
            "product_type_id": product.product_type_id,
            "created_at": product.created_at,
            "images": [
                {"id": img.id, "url": img.url, "is_primary": img.is_primary, "display_order": img.display_order}
                for img in sorted(product.images, key=lambda x: x.display_order)
            ]
        }
    }

@router.put("/{product_id}")
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)  # Admin only
):
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )
    
    # Check if new category exists (if category_id is being updated)
    if payload.category_id is not None:
        category = db.query(Category).filter(Category.id == payload.category_id).first()
        if not category:
            raise HTTPException(
                status_code=404,
                detail=f"Category with id {payload.category_id} does not exist"
            )
    
    # Check if new product type exists (if product_type_id is being updated)
    if payload.product_type_id is not None:
        product_type = db.query(ProductType).filter(ProductType.id == payload.product_type_id).first()
        if not product_type:
            raise HTTPException(
                status_code=404,
                detail=f"Product type with id {payload.product_type_id} does not exist"
            )
    
    # Update only the fields that are provided
    if payload.title is not None:
        product.title = payload.title
    if payload.description is not None:
        product.description = payload.description
    if payload.price is not None:
        product.price = payload.price
    if payload.stock is not None:
        product.stock = payload.stock
    if payload.category_id is not None:
        product.category_id = payload.category_id
    if payload.product_type_id is not None:
        product.product_type_id = payload.product_type_id
    if payload.size is not None:
        product.size = payload.size
    
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Product updated successfully",
        "data": product
    }

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)  # Admin only
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }
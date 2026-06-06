from fastapi import (Depends, HTTPException, status, APIRouter)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import admin_required

from app.models.category import Category
from app.schemas.category import CategoryCreate
from app.core.security import get_current_admin, get_current_user
import traceback

# router = APIRouter("/categories",
#                    tags= ["Categories"])
router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.post("/")
async def Create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
                          ):
    try:
        category = Category(
            name = payload.name,
            description = payload.description
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        
        return {
            "message": "Category added sucessfully",
            "data": category 
        }
    except Exception as e:
        print(f"Error {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= str(e)
        )
        
@router.get("/")
async def show_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        total = db.query(Category).count()
        categories = db.query(Category).offset(skip).limit(limit).all()
        return {
            "message": "All categories",
            "data": categories,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        print(f"Error {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        

@router.put("/{category_id}")
async def update_category(
    category_id: int,
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)  # Only admin can update
):
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        category.name = payload.name
        category.description = payload.description
        
        db.commit()
        db.refresh(category)
        
        return {
            "message": "Category updated successfully",
            "data": category
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Admin only - delete category
@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)  # Only admin can delete
):
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        db.delete(category)
        db.commit()
        
        return {
            "message": "Category deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
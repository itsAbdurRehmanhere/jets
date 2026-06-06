from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, verify_password, hash_password
from app.models.user import User

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

class ProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=300)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v


@router.get("/")
async def get_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's full profile"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": getattr(user, "phone", None),
        "address": getattr(user, "address", None),
        "city": getattr(user, "city", None),
        "country": getattr(user, "country", None),
        "is_admin": user.is_admin
    }


@router.put("/")
async def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.username is not None:
        existing = db.query(User).filter(
            User.username == payload.username,
            User.id != user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = payload.username

    if payload.phone is not None:
        user.phone = payload.phone
    if payload.address is not None:
        user.address = payload.address
    if payload.city is not None:
        user.city = payload.city
    if payload.country is not None:
        user.country = payload.country

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": getattr(user, "phone", None),
            "address": getattr(user, "address", None),
            "city": getattr(user, "city", None),
            "country": getattr(user, "country", None)
        }
    }


@router.put("/change-password")
async def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Change current user's password"""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.current_password, user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully"}

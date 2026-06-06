from fastapi import(HTTPException, APIRouter, Depends, Request, status)
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.security import(hash_password,verify_password, create_access_token, get_current_user, create_refresh_token)
from app.core.config import SECRET_KEY, ALGORITHM

from app.models.user import User
from app.schemas.auth import login_schema, register_schema

import traceback

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/register")
async def register(payload: register_schema, db:Session = Depends(get_db)):
    try:
        # payload = await request.json()
        # print("USER:", user)
        existing_user = db.query(User).filter(
            User.email == payload.email
        ).first()
        if existing_user:
            raise HTTPException(
                status_code= 400,
                detail= "Email already Exists"
            )
            
        #create new user
        user = User(
            username = payload.username,
            email = payload.email,
            password = hash_password(payload.password),
            is_admin = False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "message": "User Created Sucessfully",
            "user_id": user.id,
            "is_admin": user.is_admin
        }
    
    except HTTPException:
        raise
        
    except Exception as e:
        print(f"Error: {traceback.format_exc()}")
        raise HTTPException(
            status_code= status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
@router.post("/login")

async def login(
    payload: login_schema,
    db:Session = Depends(get_db)
):
    try:
        # payload = await request.json()
        
        user = db.query(User).filter(User.email == payload.email).first()
        
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=400,
                detail="Invalid credentials"
            )
            
        token_data = {
            "user_id": user.id,
            "is_admin": user.is_admin,
            "username": user.username,
            "email": user.email
        }
        
        token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        
        
        return {
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
            "user_id": user.id,
            "username": user.username,
            "is_admin": user.is_admin   
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error:{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        

@router.post("/refresh")
async def refresh_token(refresh_token: str):

    try:

        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        token_data = {
            "user_id": payload["user_id"],
            "is_admin": payload["is_admin"],
            "username": payload["username"]
        }

        new_access_token = create_access_token(
            token_data
        )

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
        
@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "is_admin": current_user["is_admin"]
    }

@router.get("/check-email")
async def check_email_exists(email: str, db: Session = Depends(get_db)):
    """Check if email exists in database (for guest checkout flow)"""
    try:
        user = db.query(User).filter(User.email == email).first()
        return {
            "exists": user is not None,
            "email": email,
            "message": "Email already registered" if user else "Email available for registration"
        }
    except Exception as e:
        print(f"Error: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error checking email"
        )
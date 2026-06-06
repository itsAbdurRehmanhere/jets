from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import os
from pathlib import Path

from app.routes import auth, categories, product, uploads, order, cart, product_type, profile, admin
from app.core.database import engine, Base
from app.init_db import create_tables, create_default_admin

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Create products subdirectory
PRODUCTS_UPLOAD_DIR = UPLOAD_DIR / "products"
PRODUCTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Your API",
    description="API Documentation",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,  # Keep token after page refresh
    }
)

# Add CORS middleware (allows frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup events
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("Starting application...")
    
    # Create database tables using unpooled connection
    create_tables()
    
    # Create default admin user
    create_default_admin()
    
    print("Application startup complete!")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("🛑 Application shutting down...")

# Include routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(product.router)
app.include_router(product_type.router)
app.include_router(uploads.router)
app.include_router(order.router)
app.include_router(cart.router)
app.include_router(profile.router)
app.include_router(admin.router)

# Serve static files (uploaded images)
app.mount("/media", StaticFiles(directory=str(UPLOAD_DIR)), name="media")

@app.get("/")
async def root():
    return {
        "message": "Aircraft Store API Running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "categories": "/categories",
            "products": "/products",
            "product-types": "/product-types",
            "uploads": "/uploads",
            "orders": "/orders",
            "cart": "/cart",
            "profile": "/profile",
            "media": "/media"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "database": "connected",
        "uploads_dir": str(UPLOAD_DIR)
    }
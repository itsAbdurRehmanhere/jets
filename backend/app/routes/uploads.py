import uuid
from typing import List
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin
from app.core import storage
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product_image import ProductImageResponse, ProductImageUpdate

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"]
)

# Object path prefix inside the Supabase bucket
STORAGE_PREFIX = "products"

# Allowed file types and max size
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_file(file: UploadFile):
    """Validate file type."""
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for {file.filename}. Allowed types: .jpg, .jpeg, .png, .gif, .webp"
        )

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for {file.filename}. Please upload a valid image file."
        )


async def _store_image(file: UploadFile, content: bytes) -> tuple[str, str]:
    """Upload bytes to Supabase Storage. Returns (object_path, public_url)."""
    extension = Path(file.filename).suffix.lower()
    object_path = f"{STORAGE_PREFIX}/{uuid.uuid4()}{extension}"
    url = await storage.upload(object_path, content, file.content_type)
    return object_path, url


@router.post("/products/{product_id}", status_code=status.HTTP_201_CREATED)
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Upload multiple images for a product to Supabase Storage (max 10 files, 5MB each)."""

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")

    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="At least one file is required")

    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files can be uploaded at once")

    existing_count = db.query(ProductImage).filter(ProductImage.product_id == product_id).count()

    uploaded_images = []
    errors = []

    for file in files:
        try:
            validate_file(file)
            content = await file.read()
            file_size = len(content)

            if file_size > MAX_FILE_SIZE:
                errors.append({"filename": file.filename, "error": f"File too large (max {MAX_FILE_SIZE // (1024*1024)}MB)"})
                continue

            object_path, url = await _store_image(file, content)

            is_primary = (existing_count == 0 and len(uploaded_images) == 0)

            product_image = ProductImage(
                product_id=product_id,
                filename=Path(object_path).name,
                url=url,
                file_path=object_path,
                file_size=file_size,
                is_primary=is_primary,
                display_order=existing_count + len(uploaded_images)
            )
            db.add(product_image)
            uploaded_images.append(product_image)

        except HTTPException as e:
            errors.append({"filename": file.filename, "error": e.detail})
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})
        finally:
            await file.close()

    if not uploaded_images and errors:
        raise HTTPException(status_code=400, detail={"message": "No files uploaded successfully", "errors": errors})

    if uploaded_images:
        db.commit()
        for img in uploaded_images:
            db.refresh(img)

    return {
        "message": f"Successfully uploaded {len(uploaded_images)} image(s)",
        "product_id": product_id,
        "product_title": product.title,
        "total_uploaded": len(uploaded_images),
        "images": [ProductImageResponse.model_validate(img) for img in uploaded_images],
        "errors": errors if errors else None
    }


@router.post("/products/{product_id}/single", status_code=status.HTTP_201_CREATED)
async def upload_single_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Upload a single image for a product to Supabase Storage."""

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")

    validate_file(file)

    content = await file.read()
    file_size = len(content)
    await file.close()

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    try:
        object_path, url = await _store_image(file, content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

    existing_images_count = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).count()

    is_primary = existing_images_count == 0

    product_image = ProductImage(
        product_id=product_id,
        filename=Path(object_path).name,
        url=url,
        file_path=object_path,
        file_size=file_size,
        is_primary=is_primary,
        display_order=existing_images_count
    )

    db.add(product_image)
    db.commit()
    db.refresh(product_image)

    return {
        "message": "Image uploaded successfully",
        "product_id": product_id,
        "product_title": product.title,
        "image": ProductImageResponse.model_validate(product_image)
    }


@router.get("/products/{product_id}/images")
async def get_product_images(
    product_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all images for a specific product with pagination"""

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )

    query = db.query(ProductImage).filter(ProductImage.product_id == product_id)
    total = query.count()

    images = query.order_by(ProductImage.display_order).offset(skip).limit(limit).all()

    return {
        "product_id": product_id,
        "product_title": product.title,
        "total_images": total,
        "skip": skip,
        "limit": limit,
        "images": [ProductImageResponse.model_validate(img) for img in images]
    }


@router.get("/images/{image_id}")
async def get_image_by_id(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Get a single image by its ID"""

    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail=f"Image with id {image_id} not found"
        )

    return ProductImageResponse.model_validate(image)


@router.put("/images/{image_id}")
async def update_image(
    image_id: int,
    image_data: ProductImageUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Update image details (primary status, display order)"""

    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail=f"Image with id {image_id} not found"
        )

    if image_data.is_primary is not None and image_data.is_primary:
        db.query(ProductImage).filter(
            ProductImage.product_id == image.product_id,
            ProductImage.id != image_id
        ).update({"is_primary": False})
        image.is_primary = True

    if image_data.display_order is not None:
        image.display_order = image_data.display_order

    db.commit()
    db.refresh(image)

    return {
        "message": "Image updated successfully",
        "data": ProductImageResponse.model_validate(image)
    }


@router.put("/products/{product_id}/images/primary/{image_id}")
async def set_primary_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Set a specific image as the primary image for a product"""

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )

    image = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id
    ).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail=f"Image with id {image_id} not found for this product"
        )

    db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).update({"is_primary": False})

    image.is_primary = True

    db.commit()
    db.refresh(image)

    return {
        "message": "Primary image set successfully",
        "data": ProductImageResponse.model_validate(image)
    }


@router.delete("/images/{image_id}")
async def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Delete a single image from Supabase Storage and the database"""

    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail=f"Image with id {image_id} not found"
        )

    # Remove the object from Supabase Storage (file_path holds the bucket path)
    if image.file_path:
        await storage.delete(image.file_path)

    product_id = image.product_id

    db.delete(image)
    db.commit()

    # Promote a remaining image to primary if needed
    remaining_images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).order_by(ProductImage.display_order).first()

    if remaining_images and not remaining_images.is_primary:
        remaining_images.is_primary = True
        db.commit()

    return {
        "message": "Image deleted successfully from storage and database",
        "deleted_image_id": image_id
    }


@router.delete("/products/{product_id}/images")
async def delete_all_product_images(
    product_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Delete all images for a product from Supabase Storage and the database"""

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )

    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()

    if not images:
        return {
            "message": "No images found for this product",
            "deleted_count": 0
        }

    for image in images:
        if image.file_path:
            await storage.delete(image.file_path)

    deleted_count = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).delete()

    db.commit()

    return {
        "message": f"Successfully deleted {deleted_count} images from storage and database",
        "product_id": product_id,
        "product_title": product.title,
        "deleted_count": deleted_count
    }


@router.get("/stats")
async def get_upload_stats(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Get upload statistics (admin only)"""

    total_images = db.query(ProductImage).count()
    from sqlalchemy import func as sa_func
    total_size = db.query(sa_func.sum(ProductImage.file_size)).scalar() or 0

    products_with_images = db.query(Product).join(ProductImage).distinct().count()

    recent_uploads = db.query(ProductImage).order_by(
        ProductImage.created_at.desc()
    ).limit(10).all()

    return {
        "total_images": total_images,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "products_with_images": products_with_images,
        "storage": f"supabase://{storage.SUPABASE_BUCKET}/{STORAGE_PREFIX}",
        "recent_uploads": [ProductImageResponse.model_validate(img) for img in recent_uploads]
    }

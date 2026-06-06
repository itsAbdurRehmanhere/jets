import os
import shutil
import uuid
from typing import List, Optional
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin  # Changed to use get_current_admin
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product_image import ProductImageResponse, ProductImageUpdate

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"]
)

# # Define upload directory (absolute path for clarity)
# BASE_DIR = Path(__file__).resolve().parent.parent  # Goes to app directory
# UPLOAD_DIR = BASE_DIR / "uploads" / "products"
# UPLOAD_DIR.mkdir(parents=True, exist_ok=True)  # Creates: app/uploads/products/

# # Allowed file types and max size
# ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
# ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"}
# MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# print(f"Images will be saved to: {UPLOAD_DIR.absolute()}")


# def validate_file(file: UploadFile):
#     """Validate file type and size"""
#     # Check file extension
#     file_extension = Path(file.filename).suffix.lower()
#     if file_extension not in ALLOWED_EXTENSIONS:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid file type for {file.filename}. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
#         )
    
#     # Check MIME type
#     if file.content_type not in ALLOWED_MIME_TYPES:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid MIME type for {file.filename}. Allowed types: image/jpeg, image/png, image/gif, image/webp"
#         )


# def get_product_image_url(product_image: ProductImage) -> str:
#     """Get full URL for product image"""
#     return f"/media/products/{product_image.filename}"


# @router.post("/products/{product_id}", status_code=status.HTTP_201_CREATED)
# async def upload_product_images(
#     product_id: int,
#     files: List[UploadFile] = File(..., description="Select image files to upload (max 5MB each)"),
#     db: Session = Depends(get_db),
#     admin = Depends(get_current_admin)  # Changed to get_current_admin
# ):
#     """
#     Upload multiple images for a product - Images saved on server
    
#     - **product_id**: ID of the product
#     - **files**: Select one or more image files (JPEG, PNG, GIF, WebP)
    
#     Returns uploaded image details including URLs
#     """
    
#     # Check if product exists
#     product = db.query(Product).filter(Product.id == product_id).first()
#     if not product:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Product with id {product_id} not found"
#         )
    
#     if not files:
#         raise HTTPException(
#             status_code=400,
#             detail="No files provided. Please select at least one image to upload."
#         )
    
#     uploaded_images = []
#     errors = []
    
#     for index, file in enumerate(files):
#         try:
#             # Validate file
#             validate_file(file)
            
#             # Read file content
#             content = await file.read()
#             file_size = len(content)
            
#             # Check file size
#             if file_size > MAX_FILE_SIZE:
#                 errors.append(f"{file.filename}: File too large (max {MAX_FILE_SIZE // (1024*1024)}MB)")
#                 continue
            
#             # Generate unique filename
#             extension = Path(file.filename).suffix.lower()
#             filename = f"{uuid.uuid4()}{extension}"
            
#             # Full path on server
#             filepath = UPLOAD_DIR / filename
            
#             # Save file to server disk
#             with open(filepath, "wb") as buffer:
#                 buffer.write(content)
            
#             # Check if this is the first image uploaded for this product
#             existing_images = db.query(ProductImage).filter(
#                 ProductImage.product_id == product_id
#             ).count()
            
#             is_primary = existing_images == 0 and index == 0
            
#             # Save image info to database
#             product_image = ProductImage(
#                 product_id=product_id,
#                 filename=filename,
#                 url=get_product_image_url(None),  # Will be set after creation
#                 file_path=str(filepath),
#                 file_size=file_size,
#                 is_primary=is_primary,
#                 display_order=existing_images + index
#             )
            
#             # Update URL with actual filename
#             product_image.url = f"/media/products/{filename}"
            
#             db.add(product_image)
#             uploaded_images.append(product_image)
            
#         except HTTPException as e:
#             errors.append(f"{file.filename}: {e.detail}")
#         except Exception as e:
#             errors.append(f"{file.filename}: {str(e)}")
#         finally:
#             await file.close()
    
#     if uploaded_images:
#         db.commit()
        
#         # Refresh all images
#         for img in uploaded_images:
#             db.refresh(img)
    
#     response_data = {
#         "message": f"Successfully uploaded {len(uploaded_images)} image(s)",
#         "product_id": product_id,
#         "product_title": product.title,
#         "saved_to": str(UPLOAD_DIR),
#         "total_uploaded": len(uploaded_images),
#         "images": [ProductImageResponse.model_validate(img) for img in uploaded_images]
#     }
    
#     if errors:
#         response_data["errors"] = errors
    
#     if not uploaded_images and errors:
#         raise HTTPException(
#             status_code=400,
#             detail={"message": "No files were uploaded successfully", "errors": errors}
#         )
    
#     return JSONResponse(status_code=status.HTTP_201_CREATED, content=response_data)

# Define upload directory
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file types and max size
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

print(f"Images will be saved to: {UPLOAD_DIR.absolute()}")


def validate_file(file: UploadFile):
    """Validate file type and size"""
    # Check file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for {file.filename}. Allowed types: .jpg, .jpeg, .png, .gif, .webp"
        )
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for {file.filename}. Please upload a valid image file."
        )


# IMPORTANT: Use fastapi.Form() for multiple files
# @router.post("/products/{product_id}", status_code=status.HTTP_201_CREATED)
# async def upload_product_images(
#     product_id: int,
#     files: List[UploadFile] = File(...),
#     db: Session = Depends(get_db),
#     admin = Depends(get_current_admin)
# ):
#     """
#     Upload multiple images for a product - Images saved on server
    
#     - **product_id**: ID of the product
#     - **files**: Select one or more image files (JPEG, PNG, GIF, WebP)
    
#     Returns uploaded image details including URLs
#     """
    
#     # Check if product exists
#     product = db.query(Product).filter(Product.id == product_id).first()
#     if not product:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Product with id {product_id} not found"
#         )
    
#     if not files or files[0].filename == '':
#         raise HTTPException(
#             status_code=400,
#             detail="No files provided. Please select at least one image to upload."
#         )
    
#     uploaded_images = []
#     errors = []
    
#     for index, file in enumerate(files):
#         if not file or file.filename == '':
#             continue
            
#         try:
#             # Validate file
#             validate_file(file)
            
#             # Read file content
#             content = await file.read()
#             file_size = len(content)
            
#             # Check file size
#             if file_size > MAX_FILE_SIZE:
#                 errors.append(f"{file.filename}: File too large (max {MAX_FILE_SIZE // (1024*1024)}MB)")
#                 continue
            
#             # Generate unique filename
#             extension = Path(file.filename).suffix.lower()
#             filename = f"{uuid.uuid4()}{extension}"
            
#             # Full path on server
#             filepath = UPLOAD_DIR / filename
            
#             # Save file to server disk
#             with open(filepath, "wb") as buffer:
#                 buffer.write(content)
            
#             # Check if this is the first image uploaded for this product
#             existing_images = db.query(ProductImage).filter(
#                 ProductImage.product_id == product_id
#             ).count()
            
#             is_primary = existing_images == 0 and index == 0
            
#             # Save image info to database
#             product_image = ProductImage(
#                 product_id=product_id,
#                 filename=filename,
#                 url=f"/media/products/{filename}",
#                 file_path=str(filepath),
#                 file_size=file_size,
#                 is_primary=is_primary,
#                 display_order=existing_images + index
#             )
            
#             db.add(product_image)
#             uploaded_images.append(product_image)
            
#         except HTTPException as e:
#             errors.append(f"{file.filename}: {e.detail}")
#         except Exception as e:
#             errors.append(f"{file.filename}: {str(e)}")
#         finally:
#             await file.close()
    
#     if uploaded_images:
#         db.commit()
        
#         # Refresh all images
#         for img in uploaded_images:
#             db.refresh(img)
    
#     response_data = {
#         "message": f"Successfully uploaded {len(uploaded_images)} image(s)",
#         "product_id": product_id,
#         "product_title": product.title,
#         "saved_to": str(UPLOAD_DIR),
#         "total_uploaded": len(uploaded_images),
#         "images": [ProductImageResponse.model_validate(img) for img in uploaded_images]
#     }
    
#     if errors:
#         response_data["errors"] = errors
    
#     if not uploaded_images and errors:
#         raise HTTPException(
#             status_code=400,
#             detail={"message": "No files were uploaded successfully", "errors": errors}
#         )
    
#     return JSONResponse(status_code=status.HTTP_201_CREATED, content=response_data)


# @router.post("/products/{product_id}/images", status_code=status.HTTP_201_CREATED)  # Changed endpoint
# async def upload_multiple_product_images(
#     product_id: int,
#     files: List[UploadFile] = File(...),  # Changed to list of files
#     db: Session = Depends(get_db),
#     admin = Depends(get_current_admin)
# ):
#     """Upload multiple images for a product"""
    
#     # Check if product exists
#     product = db.query(Product).filter(Product.id == product_id).first()
#     if not product:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Product with id {product_id} not found"
#         )
    
#     # Get existing images count
#     existing_images_count = db.query(ProductImage).filter(
#         ProductImage.product_id == product_id
#     ).count()
    
#     uploaded_images = []
#     errors = []
    
#     # Process each file
#     for idx, file in enumerate(files):
#         try:
#             # Validate file
#             validate_file(file)
            
#             # Read file content
#             content = await file.read()
#             file_size = len(content)
            
#             # Check file size
#             if file_size > MAX_FILE_SIZE:
#                 errors.append({
#                     "filename": file.filename,
#                     "error": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
#                 })
#                 continue
            
#             # Generate unique filename
#             extension = Path(file.filename).suffix.lower()
#             filename = f"{uuid.uuid4()}{extension}"
            
#             # Full path on server
#             filepath = UPLOAD_DIR / filename
            
#             # Save file to server disk
#             with open(filepath, "wb") as buffer:
#                 buffer.write(content)
            
#             # Determine if this should be primary
#             is_primary = (existing_images_count == 0 and len(uploaded_images) == 0)
            
#             # Save to database
#             product_image = ProductImage(
#                 product_id=product_id,
#                 filename=filename,
#                 url=f"/media/products/{filename}",
#                 file_path=str(filepath),
#                 file_size=file_size,
#                 is_primary=is_primary,
#                 display_order=existing_images_count + len(uploaded_images)
#             )
            
#             db.add(product_image)
#             uploaded_images.append(product_image)
            
#         except Exception as e:
#             errors.append({
#                 "filename": file.filename,
#                 "error": str(e)
#             })
#         finally:
#             await file.close()
    
#     # Commit all successful uploads
#     if uploaded_images:
#         db.commit()
#         for img in uploaded_images:
#             db.refresh(img)
    
#     return {
#         "message": f"Uploaded {len(uploaded_images)} images successfully",
#         "product_id": product_id,
#         "product_title": product.title,
#         "uploaded_images": [ProductImageResponse.model_validate(img) for img in uploaded_images],
#         "errors": errors if errors else None,
#         "total_uploaded": len(uploaded_images),
#         "total_failed": len(errors)
#     }

# @router.post("/products/{product_id}/images", status_code=status.HTTP_201_CREATED)
# async def upload_multiple_product_images(
#     product_id: int,
#     db: Session = Depends(get_db),
#     admin = Depends(get_current_admin),
#     files: List[UploadFile] = File(..., description="Multiple image files to upload (max 10)")
# ):
#     """Upload multiple images for a product"""
    
#     # Check if product exists
#     product = db.query(Product).filter(Product.id == product_id).first()
#     if not product:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Product with id {product_id} not found"
#         )
    
#     # Validate at least one file
#     if not files or len(files) == 0:
#         raise HTTPException(
#             status_code=400,
#             detail="At least one file is required"
#         )
    
#     # Limit number of files
#     if len(files) > 10:
#         raise HTTPException(
#             status_code=400,
#             detail="Maximum 10 files can be uploaded at once"
#         )
    
#     # Get existing images count
#     existing_images_count = db.query(ProductImage).filter(
#         ProductImage.product_id == product_id
#     ).count()
    
#     uploaded_images = []
#     errors = []
    
#     # Process each file
#     for idx, file in enumerate(files):
#         try:
#             # Skip if file is empty
#             if file.size == 0:
#                 errors.append({
#                     "filename": file.filename,
#                     "error": "Empty file"
#                 })
#                 continue
            
#             # Validate file
#             validate_file(file)
            
#             # Read file content
#             content = await file.read()
#             file_size = len(content)
            
#             # Check file size
#             if file_size > MAX_FILE_SIZE:
#                 errors.append({
#                     "filename": file.filename,
#                     "error": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
#                 })
#                 continue
            
#             # Generate unique filename
#             extension = Path(file.filename).suffix.lower()
#             filename = f"{uuid.uuid4()}{extension}"
            
#             # Full path on server
#             filepath = UPLOAD_DIR / filename
            
#             # Save file to server disk
#             with open(filepath, "wb") as buffer:
#                 buffer.write(content)
            
#             # Determine if this should be primary
#             is_primary = (existing_images_count == 0 and len(uploaded_images) == 0)
            
#             # Save to database
#             product_image = ProductImage(
#                 product_id=product_id,
#                 filename=filename,
#                 url=f"/media/products/{filename}",
#                 file_path=str(filepath),
#                 file_size=file_size,
#                 is_primary=is_primary,
#                 display_order=existing_images_count + len(uploaded_images)
#             )
            
#             db.add(product_image)
#             uploaded_images.append(product_image)
            
#         except Exception as e:
#             errors.append({
#                 "filename": file.filename,
#                 "error": str(e)
#             })
#         finally:
#             await file.close()
    
#     # Commit all successful uploads
#     if uploaded_images:
#         db.commit()
#         for img in uploaded_images:
#             db.refresh(img)
    
#     # Prepare response
#     response = {
#         "product_id": product_id,
#         "product_title": product.title,
#         "total_uploaded": len(uploaded_images),
#         "total_failed": len(errors)
#     }
    
#     if uploaded_images:
#         response["uploaded_images"] = [ProductImageResponse.model_validate(img) for img in uploaded_images]
    
#     if errors:
#         response["errors"] = errors
#         response["message"] = f"Uploaded {len(uploaded_images)} out of {len(files)} images"
#     else:
#         response["message"] = f"Successfully uploaded {len(uploaded_images)} images"
    
#     return response


@router.post("/products/{product_id}", status_code=status.HTTP_201_CREATED)
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Upload multiple images for a product (max 10 files, 5MB each)"""

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

    for idx, file in enumerate(files):
        try:
            validate_file(file)
            content = await file.read()
            file_size = len(content)

            if file_size > MAX_FILE_SIZE:
                errors.append({"filename": file.filename, "error": f"File too large (max {MAX_FILE_SIZE // (1024*1024)}MB)"})
                continue

            extension = Path(file.filename).suffix.lower()
            filename = f"{uuid.uuid4()}{extension}"
            filepath = UPLOAD_DIR / filename

            with open(filepath, "wb") as buffer:
                buffer.write(content)

            is_primary = (existing_count == 0 and len(uploaded_images) == 0)

            product_image = ProductImage(
                product_id=product_id,
                filename=filename,
                url=f"/media/products/{filename}",
                file_path=str(filepath),
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
    """Upload a single image for a product"""
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )
    
    # Validate file
    validate_file(file)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    extension = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{extension}"
    
    # Full path on server
    filepath = UPLOAD_DIR / filename
    
    # Save file to server disk
    try:
        with open(filepath, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )
    finally:
        await file.close()
    
    # Check existing images
    existing_images_count = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).count()
    
    is_primary = existing_images_count == 0
    
    # Save to database
    product_image = ProductImage(
        product_id=product_id,
        filename=filename,
        url=f"/media/products/{filename}",
        file_path=str(filepath),
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
    
    # Update is_primary
    if image_data.is_primary is not None and image_data.is_primary:
        # Remove primary status from all other images of this product
        db.query(ProductImage).filter(
            ProductImage.product_id == image.product_id,
            ProductImage.id != image_id
        ).update({"is_primary": False})
        image.is_primary = True
    
    # Update display_order
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
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )
    
    # Check if image exists and belongs to this product
    image = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=404,
            detail=f"Image with id {image_id} not found for this product"
        )
    
    # Remove primary status from all images of this product
    db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).update({"is_primary": False})
    
    # Set this image as primary
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
    """Delete a single image from server and database"""
    
    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    
    if not image:
        raise HTTPException(
            status_code=404,
            detail=f"Image with id {image_id} not found"
        )
    
    # Delete file from server filesystem
    filepath = UPLOAD_DIR / image.filename
    if filepath.exists():
        filepath.unlink()  # Delete the file
        print(f"Deleted file: {filepath}")
    else:
        print(f"File not found: {filepath}")
    
    # Store product_id for response
    product_id = image.product_id
    
    # Delete from database
    db.delete(image)
    db.commit()
    
    # Check if there are remaining images and set a new primary if needed
    remaining_images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).order_by(ProductImage.display_order).first()
    
    if remaining_images and not remaining_images.is_primary:
        remaining_images.is_primary = True
        db.commit()
    
    return {
        "message": "Image deleted successfully from server and database",
        "deleted_image_id": image_id,
        "deleted_file": str(filepath)
    }


@router.delete("/products/{product_id}/images")
async def delete_all_product_images(
    product_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Delete all images for a product from server and database"""
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id {product_id} not found"
        )
    
    # Get all images
    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    
    if not images:
        return {
            "message": "No images found for this product",
            "deleted_count": 0
        }
    
    # Delete files from server filesystem
    deleted_files = []
    for image in images:
        filepath = UPLOAD_DIR / image.filename
        if filepath.exists():
            filepath.unlink()
            deleted_files.append(str(filepath))
    
    # Delete from database
    deleted_count = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).delete()
    
    db.commit()
    
    return {
        "message": f"Successfully deleted {deleted_count} images from server and database",
        "product_id": product_id,
        "product_title": product.title,
        "deleted_count": deleted_count,
        "deleted_files": deleted_files
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
    
    # Get products with images count
    products_with_images = db.query(Product).join(ProductImage).distinct().count()
    
    # Get recent uploads
    recent_uploads = db.query(ProductImage).order_by(
        ProductImage.created_at.desc()
    ).limit(10).all()
    
    return {
        "total_images": total_images,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "products_with_images": products_with_images,
        "storage_path": str(UPLOAD_DIR),
        "recent_uploads": [ProductImageResponse.model_validate(img) for img in recent_uploads]
    }
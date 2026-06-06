# E-Commerce API Documentation

## Authentication
All user endpoints require a valid JWT token obtained from `/auth/login`.
Admin endpoints require `is_admin: true` in the token.

---

## USER ENDPOINTS

### Authentication Routes
**Base URL**: `/auth`

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string (min 6 chars)"
}

Response: {
  "message": "User Created Successfully",
  "user_id": 1,
  "is_admin": false
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: {
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "username": "string",
    "is_admin": false
  }
}
```

---

### Product Routes
**Base URL**: `/products`

#### Get All Products (with pagination)
```
GET /products?skip=0&limit=10&category_id=1&search=keyword
Authorization: Bearer {token}

Response: {
  "data": [
    {
      "id": 1,
      "title": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "stock": 10,
      "category_id": 1,
      "created_at": "2026-05-20T...",
      "updated_at": "2026-05-20T...",
      "images": []
    }
  ],
  "total": 50,
  "skip": 0,
  "limit": 10,
  "pages": 5,
  "current_page": 1
}
```

#### Get Product by ID
```
GET /products/{product_id}
Authorization: Bearer {token}

Response: {
  "data": {
    "id": 1,
    "title": "Product Name",
    "price": 99.99,
    ...
  }
}
```

#### Get Products by Category
```
GET /products/category/{category_id}?skip=0&limit=10
Authorization: Bearer {token}

Response: {
  "category": {
    "id": 1,
    "name": "Category Name",
    "description": "..."
  },
  "products": [...],
  "total": 10,
  "skip": 0,
  "limit": 10
}
```

---

### Cart Routes
**Base URL**: `/cart`

#### Add Item to Cart
```
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}

Response: {
  "message": "Item added to cart successfully",
  "product_id": 1,
  "quantity": 2
}
```

#### Get Cart
```
GET /cart/
Authorization: Bearer {token}

Response: {
  "cart_id": 1,
  "user_id": 1,
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Product Name",
      "product_price": 99.99,
      "quantity": 2,
      "subtotal": 199.98,
      "product_image": "url or null"
    }
  ],
  "total_items": 1,
  "total_price": 199.98
}
```

#### Update Cart Item Quantity
```
PUT /cart/items/{cart_item_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}

Response: {
  "message": "Cart item updated successfully",
  "product_id": 1,
  "quantity": 3
}
```

#### Remove Item from Cart
```
DELETE /cart/items/{cart_item_id}
Authorization: Bearer {token}

Response: {
  "message": "Item removed from cart successfully",
  "product_id": 1
}
```

#### Clear Cart
```
DELETE /cart/
Authorization: Bearer {token}

Response: {
  "message": "Cart cleared successfully"
}
```

---

### Orders & Checkout

#### Checkout (Create Order from Cart)
```
POST /orders/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "1234567890",
  "shipping_address": "123 Main St, Apt 4",
  "shipping_city": "New York",
  "customer_notes": "Please handle with care",
  "send_confirmation_email": true
}

Response: {
  "message": "Order created successfully",
  "order": {
    "order_id": 1,
    "order_number": "ORD-20260520-ABC12345",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "shipping_address": "123 Main St, Apt 4",
    "shipping_city": "New York",
    "subtotal": 199.98,
    "tax": 20.00,
    "shipping_cost": 10.00,
    "total": 229.98,
    "order_status": "pending",
    "created_at": "2026-05-20T..."
  },
  "items_count": 1,
  "email_sent": true
}
```

#### Get My Orders
```
GET /orders/?skip=0&limit=10&status=pending
Authorization: Bearer {token}

Response: {
  "data": [
    {
      "id": 1,
      "order_number": "ORD-20260520-ABC12345",
      "customer_name": "John Doe",
      "total": 229.98,
      "order_status": "pending",
      "payment_status": "pending",
      "created_at": "2026-05-20T...",
      "items_count": 2
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 10
}
```

#### Get Order Details
```
GET /orders/{order_id}
Authorization: Bearer {token}

Response: {
  "order": {
    "id": 1,
    "order_number": "ORD-20260520-ABC12345",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "1234567890",
    "shipping_address": "123 Main St, Apt 4",
    "shipping_city": "New York",
    "customer_notes": "Please handle with care",
    "subtotal": 199.98,
    "tax": 20.00,
    "shipping_cost": 10.00,
    "total": 229.98,
    "order_status": "pending",
    "payment_status": "pending",
    "created_at": "2026-05-20T...",
    ...
  },
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Product Name",
      "product_price": 99.99,
      "product_image": "url",
      "quantity": 2,
      "subtotal": 199.98
    }
  ],
  "items_count": 1
}
```

#### Cancel Order
```
DELETE /orders/{order_id}
Authorization: Bearer {token}

Response: {
  "message": "Order cancelled successfully",
  "order_id": 1,
  "status": "cancelled",
  "cancelled_items_count": 1,
  "cancelled_items": [...]
}
```

---

## ADMIN ENDPOINTS

### Product Management
**Base URL**: `/products`

#### Create Product
```
POST /products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "category_id": 1
}

Response: {
  "message": "Product created successfully",
  "data": {...}
}
```

#### Update Product
```
PUT /products/{product_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Updated Name",
  "price": 129.99,
  "stock": 50,
  ...
}

Response: {
  "message": "Product updated successfully",
  "data": {...}
}
```

#### Delete Product
```
DELETE /products/{product_id}
Authorization: Bearer {admin_token}

Response: {
  "message": "Product deleted successfully"
}
```

---

### Order Management
**Base URL**: `/orders`

#### Get All Orders (Admin)
```
GET /orders/admin/all?skip=0&limit=10&status=pending
Authorization: Bearer {admin_token}

Response: {
  "data": [
    {
      "id": 1,
      "order_number": "ORD-20260520-ABC12345",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "1234567890",
      "shipping_address": "...",
      "customer_notes": "...",
      "total": 229.98,
      "order_status": "pending",
      "payment_status": "pending",
      "created_at": "..."
    }
  ],
  "total": 15,
  "skip": 0,
  "limit": 10
}
```

#### Update Order Status (Admin)
```
PUT /orders/{order_id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "order_status": "processing",
  "payment_status": "paid",
  "tracking_number": "TRACK123456",
  "tracking_company": "FedEx",
  "admin_notes": "Order is being prepared"
}

Response: {
  "message": "Order updated successfully",
  "data": {...}
}
```

#### Delete Order (Admin)
```
DELETE /orders/admin/{order_id}
Authorization: Bearer {admin_token}

Response: {
  "message": "Order deleted successfully",
  "deleted_items_count": 2
}
```

---

## Order Status Values
- `pending` - Order created, awaiting payment
- `processing` - Payment received, preparing shipment
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `refunded` - Order refunded

## Payment Status Values
- `pending` - Awaiting payment
- `paid` - Payment received
- `failed` - Payment failed
- `refunded` - Payment refunded

---

## Email Configuration

For email notifications to work, configure these environment variables:
- `SMTP_HOST`: SMTP server hostname (default: smtp.gmail.com)
- `SMTP_PORT`: SMTP port (default: 587)
- `SMTP_USER`: SMTP username/email
- `SMTP_PASSWORD`: SMTP password or app-specific password
- `SMTP_FROM_EMAIL`: Email to send from

### Gmail Setup Example:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password at: myaccount.google.com/apppasswords
3. Use the generated password in `SMTP_PASSWORD`

---

## Pagination Examples

### Get first page of products (10 per page)
```
GET /products?skip=0&limit=10
```

### Get second page
```
GET /products?skip=10&limit=10
```

### Get third page
```
GET /products?skip=20&limit=10
```

### Response includes pagination info:
```json
{
  "data": [...],
  "total": 50,
  "skip": 0,
  "limit": 10,
  "pages": 5,
  "current_page": 1
}
```

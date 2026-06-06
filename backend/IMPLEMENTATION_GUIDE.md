# E-Commerce Implementation Guide

## Overview
This document explains how to use the e-commerce features implemented in your FastAPI backend.

---

## Features Implemented

### 1. User Authentication & Authorization
- Users can register with username, email, and password
- Users can login to get JWT tokens
- Admin users have full access to management endpoints
- Regular users can only view/manage their own data

### 2. Product Browsing with Pagination
Users can browse products with:
- **Pagination**: Default 10 items per page (configurable)
- **Search**: Filter products by title
- **Category filtering**: View products by category
- **Sorting**: Products sorted by newest first

**Example**: Browse page 1 of products
```
GET /products?skip=0&limit=10
```

### 3. Shopping Cart
Users can manage a personal shopping cart:
- **Add items**: Add products with desired quantity
- **View cart**: See all items with total price
- **Update quantities**: Modify item quantities
- **Remove items**: Delete specific items
- **Clear cart**: Empty entire cart at once

**Workflow**:
```
1. POST /cart/add              (Add item)
2. GET /cart/                  (View cart)
3. PUT /cart/items/{id}        (Update quantity)
4. DELETE /cart/items/{id}     (Remove item)
5. DELETE /cart/               (Clear cart)
```

### 4. Checkout & Order Creation
**Complete checkout process**:

```
1. User adds items to cart
   POST /cart/add { product_id: 1, quantity: 2 }

2. User views cart to verify
   GET /cart/

3. User proceeds to checkout with customer info
   POST /orders/checkout {
     "customer_name": "John Doe",
     "customer_email": "john@example.com",
     "customer_phone": "1234567890",
     "shipping_address": "123 Main St, Apt 4",
     "shipping_city": "New York",
     "customer_notes": "Optional special instructions",
     "send_confirmation_email": true
   }

4. Order is created with:
   - All customer information stored
   - Subtotal calculated from cart items
   - Tax calculated (10% of subtotal)
   - Shipping cost calculated ($0 if > $100, else $10)
   - Total: subtotal + tax + shipping
   - Product stock automatically reduced
   - Cart cleared
   - Confirmation email sent (if requested)
```

### 5. Email Confirmations
**When an order is created**, if `send_confirmation_email: true`, the customer receives:
- Professional HTML email with order details
- Itemized list of products ordered
- Price breakdown (subtotal, tax, shipping, total)
- Shipping address confirmation
- Order number for reference

### 6. Customer Information Collection
**During checkout**, users provide:
```json
{
  "customer_name": "Full name (stored with order)",
  "customer_email": "Email address (for confirmation)",
  "customer_phone": "Phone number",
  "shipping_address": "Street address",
  "shipping_city": "City",
  "customer_notes": "Special instructions"
}
```
This information is:
- Stored permanently with the order
- Only visible to admin after order is placed
- Visible to the customer who created the order

### 7. Order Management

**Users can**:
- View their own orders with pagination
- See order details including items, prices, status
- Cancel pending/processing orders

**Admins can**:
- View ALL orders across all users
- See complete customer information
- Update order status (pending → processing → shipped → delivered)
- Add tracking information
- Add internal notes
- Delete orders

### 8. Admin Dashboard Features
Admins can:
- Create products
- Update products (title, price, stock, etc.)
- Delete products
- Manage categories
- View all orders with customer info
- Update order status and tracking
- View financial data per order

---

## Database Schema

### Users Table
```
id (PK)
username
email (unique)
password (hashed)
is_admin
created_at
```

### Products Table
```
id (PK)
title
description
price
stock
category_id (FK)
created_at
updated_at
```

### Cart Table
```
id (PK)
user_id (FK, unique) - One cart per user
created_at
updated_at
```

### CartItem Table
```
id (PK)
cart_id (FK)
product_id (FK)
quantity
created_at
updated_at
```

### Orders Table
```
id (PK)
user_id (FK)
order_number (unique)
customer_name
customer_email
customer_phone
shipping_address
shipping_city
shipping_country
subtotal
tax
shipping_cost
discount
total
order_status (pending, processing, shipped, delivered, cancelled)
payment_status (pending, paid, failed, refunded)
customer_notes
admin_notes
created_at
updated_at
```

### OrderItems Table
```
id (PK)
order_id (FK)
product_id (FK)
product_name (snapshot)
product_price (snapshot)
quantity
subtotal
created_at
```

---

## Configuration Required

### 1. Environment Variables
Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 2. Email Setup (Gmail Example)
1. Enable 2-Factor Authentication on Gmail
2. Go to myaccount.google.com/apppasswords
3. Generate an App Password
4. Use the generated password in `.env`

### 3. Database Setup
```bash
# Ensure PostgreSQL is running
# Create database
createdb aircraft_store

# The app will create tables automatically on startup
```

---

## API Usage Examples

### Complete User Journey

#### 1. Register
```bash
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### 2. Login
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "securepass123"
}
# Returns: access_token, refresh_token
```

#### 3. Browse Products
```bash
GET /products?skip=0&limit=10
# Returns paginated list of products with images
```

#### 4. Add to Cart
```bash
POST /cart/add
Authorization: Bearer {token}
{
  "product_id": 1,
  "quantity": 2
}
```

#### 5. View Cart
```bash
GET /cart/
Authorization: Bearer {token}
# Returns all items with total price
```

#### 6. Checkout
```bash
POST /orders/checkout
Authorization: Bearer {token}
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "5551234567",
  "shipping_address": "123 Main Street",
  "shipping_city": "Springfield",
  "customer_notes": "Please ring doorbell",
  "send_confirmation_email": true
}
# Returns: Order created with number, items, totals
# Customer receives email confirmation
```

#### 7. View Orders
```bash
GET /orders/?skip=0&limit=10
Authorization: Bearer {token}
# Returns user's orders with status, total, items count
```

### Admin Tasks

#### Get All Orders
```bash
GET /orders/admin/all?skip=0&limit=10
Authorization: Bearer {admin_token}
```

#### Update Order Status
```bash
PUT /orders/{order_id}/status
Authorization: Bearer {admin_token}
{
  "order_status": "shipped",
  "payment_status": "paid",
  "tracking_number": "1Z999AA10123456784",
  "tracking_company": "UPS",
  "admin_notes": "Order dispatched"
}
```

---

## Pricing Calculations

### Order Total Calculation
```
Subtotal = SUM(product_price × quantity) for all items

Tax = Subtotal × 0.10  (10% tax)

Shipping = 
  - $0.00 if Subtotal >= $100
  - $10.00 if Subtotal < $100

Total = Subtotal + Tax + Shipping
```

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt
2. **JWT Tokens**: Stateless authentication with JWT
3. **Role-based Access**: Admin-only endpoints protected
4. **CORS**: Configured for cross-origin requests
5. **Stock Management**: Product stock automatically reduced on order
6. **Data Validation**: All inputs validated using Pydantic
7. **Email Security**: SMTP with TLS encryption

---

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Ensure "Less secure apps" or App Password is set (Gmail)
3. Check firewall allows port 587
4. Verify email account has 2FA enabled (Gmail)

### Cart is Empty Error
- Ensure user is logged in
- Cart must exist (created automatically on first add)
- Items must be in cart before checkout

### Insufficient Stock Error
- Product doesn't have enough units available
- Admin can update product stock via admin endpoint

### Order Checkout Error
- Verify all required fields are provided
- Check that customer_email is valid format
- Ensure cart has items

---

## Next Steps / Enhancements

Potential improvements:
1. **Payment Gateway**: Integrate Stripe or PayPal
2. **Wishlist**: Users can save favorites
3. **Reviews**: Product ratings and reviews
4. **Discounts**: Coupon codes and promotions
5. **Notifications**: SMS alerts for order status
6. **Inventory Alerts**: Notify admins of low stock
7. **Advanced Search**: Filters by price, rating, etc.
8. **Bulk Operations**: Admin bulk actions
9. **Analytics**: Sales reports and analytics
10. **Inventory Sync**: Real-time stock updates

---

## Support

For issues or questions about the implementation, refer to:
- `API_DOCUMENTATION.md` - Detailed API reference
- `.env.example` - Configuration template
- FastAPI docs: http://localhost:8000/docs
- Swagger UI: http://localhost:8000/swagger-ui

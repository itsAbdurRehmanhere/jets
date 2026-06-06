# E-Commerce System Architecture & Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   USERS      │  │   PRODUCTS   │  │    ADMIN     │           │
│  │              │  │              │  │              │           │
│  │ • Register   │  │ • Browse     │  │ • Create     │           │
│  │ • Login      │  │ • Search     │  │ • Update     │           │
│  │ • Profile    │  │ • Filter     │  │ • Delete     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   CART       │  │   ORDERS     │  │    EMAIL     │           │
│  │              │  │              │  │              │           │
│  │ • Add items  │  │ • Checkout   │  │ • Confirm    │           │
│  │ • Remove     │  │ • Status     │  │ • Track      │           │
│  │ • Update qty │  │ • Track      │  │ • Notify     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Journey Flow

### New User Path: Registration → Browsing → Checkout

```
1. REGISTRATION
   ├─ POST /auth/register
   ├─ Username, Email, Password
   └─ Response: User ID, Token

2. LOGIN
   ├─ POST /auth/login
   ├─ Email, Password
   └─ Response: Access Token, Refresh Token

3. BROWSE PRODUCTS
   ├─ GET /products?skip=0&limit=10
   ├─ View products with pagination
   ├─ Search and filter by category
   └─ View product details including images

4. ADD TO CART
   ├─ POST /cart/add
   ├─ Select product and quantity
   ├─ Cart auto-created on first add
   └─ Can add multiple items

5. MANAGE CART
   ├─ GET /cart/               (View all items)
   ├─ PUT /cart/items/{id}     (Update quantity)
   ├─ DELETE /cart/items/{id}  (Remove item)
   └─ DELETE /cart/            (Clear cart)

6. CHECKOUT
   ├─ POST /orders/checkout
   ├─ Provide customer info:
   │  ├─ customer_name
   │  ├─ customer_email
   │  ├─ customer_phone
   │  ├─ shipping_address
   │  └─ shipping_city
   ├─ System calculates:
   │  ├─ Subtotal (sum of items)
   │  ├─ Tax (10% of subtotal)
   │  ├─ Shipping ($0 if >$100, else $10)
   │  └─ Total
   ├─ Order created
   ├─ Stock updated
   ├─ Cart cleared
   └─ Email sent (optional)

7. ORDER CONFIRMATION
   ├─ Order number assigned (ORD-YYYYMMDD-CODE)
   ├─ Customer receives email (if requested)
   ├─ User can view orders via GET /orders/
   └─ User can cancel via DELETE /orders/{id}
```

---

## Admin Journey Flow

### Admin Tasks: Management & Monitoring

```
PRODUCT MANAGEMENT
├─ Create: POST /products
├─ Update: PUT /products/{id}
├─ Delete: DELETE /products/{id}
└─ View All: GET /products

ORDER MANAGEMENT
├─ View All Orders: GET /orders/admin/all
├─ View Customer Info: Each order includes
│  ├─ customer_name
│  ├─ customer_email
│  ├─ customer_phone
│  ├─ shipping_address
│  ├─ shipping_city
│  └─ customer_notes
├─ Update Status: PUT /orders/{id}/status
│  ├─ pending → processing
│  ├─ processing → shipped
│  ├─ shipped → delivered
│  └─ Can add tracking info
└─ Delete Order: DELETE /orders/admin/{id}

INVENTORY
├─ Stock automatically reduced on order
├─ Admin can adjust stock when updating products
└─ Low stock alerts (future feature)
```

---

## Database Relationships

### Entity Relationship Diagram

```
┌──────────────┐
│    USERS     │
├──────────────┤
│ id (PK)      │
│ username     │──────┐
│ email        │      │
│ password     │      │
│ is_admin     │      │
│ created_at   │      │
└──────────────┘      │
       │              │
       │ one-to-one   │
       ├─────────────►│ ┌──────────────┐
       │              └─┤    CARTS     │
       │                ├──────────────┤
       │                │ id (PK)      │
       │                │ user_id (FK) │
       │                └──────────────┘
       │                       │
       │                       │ one-to-many
       │                       ▼
       │                ┌──────────────┐
       │                │  CART_ITEMS  │
       │                ├──────────────┤
       │                │ id (PK)      │
       │                │ cart_id (FK) │
       │                │ product_id──►│──┐
       │                │ quantity     │  │
       │                └──────────────┘  │
       │                                   │
       │ one-to-many                      │
       ├─────────────┐                    │
       │             ▼                    │
       │      ┌──────────────┐            │
       │      │    ORDERS    │            │
       │      ├──────────────┤            │
       │      │ id (PK)      │            │
       │      │ user_id (FK) │            │
       │      │ order_number │            │
       │      │ customer_*   │            │
       │      │ subtotal     │            │
       │      │ tax          │            │
       │      │ shipping     │            │
       │      │ total        │            │
       │      │ status       │            │
       │      └──────────────┘            │
       │             │                    │
       │             │ one-to-many       │
       │             ▼                    │
       │      ┌──────────────┐            │
       │      │ ORDER_ITEMS  │            │
       │      ├──────────────┤            │
       │      │ id (PK)      │            │
       │      │ order_id (FK)│            │
       │      │ product_id◄──┤─────────────
       │      │ quantity     │
       │      │ subtotal     │
       │      └──────────────┘
       │
       │
       └─────────────────────────────┐
                                      │
                        ┌─────────────▼─────────┐
                        │    PRODUCTS           │
                        ├───────────────────────┤
                        │ id (PK)               │
                        │ title                 │
                        │ description           │
                        │ price                 │
                        │ stock                 │
                        │ category_id           │
                        │ created_at            │
                        │ updated_at            │
                        └───────────────────────┘
                                │
                                │ one-to-many
                                ▼
                        ┌───────────────────────┐
                        │  PRODUCT_IMAGES       │
                        ├───────────────────────┤
                        │ id (PK)               │
                        │ product_id (FK)       │
                        │ image_path            │
                        │ is_primary            │
                        └───────────────────────┘
```

---

## API Call Flow Diagram

```
CLIENT REQUEST
     │
     ▼
┌─────────────────────────────┐
│  AUTHENTICATION CHECK       │
│  (JWT Token Validation)     │
├─────────────────────────────┤
│  ✓ Valid Token              │
│  ✗ Expired Token            │
│  ✗ Missing Token            │
└─────────────────────────────┘
     │
     ├─────────────── Invalid ──────────────┐
     │                                       │
     ▼                                       ▼
┌─────────────────────┐          ┌──────────────────┐
│  AUTHORIZATION      │          │  ERROR 401/403   │
│  (Role Check)       │          └──────────────────┘
└─────────────────────┘
     │
     ├─ Admin Route ─────────────────┐
     │ ✓ User is Admin               │
     │                               │
     ├─ User Route                  │
     │ ✓ User is logged in           │
     │                               │
     ▼                               ▼
┌──────────────────────────────────────────┐
│  ROUTE HANDLER                           │
│  • Validate Input (Pydantic)             │
│  • Check Database                        │
│  • Execute Business Logic                │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  DATABASE TRANSACTION                    │
│  • Query/Insert/Update/Delete            │
│  • Validate Relationships                │
│  • Enforce Constraints                   │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  RESPONSE PREPARATION                    │
│  • Format Response Data                  │
│  • Set HTTP Status Code                  │
│  • Include Metadata                      │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  SEND RESPONSE TO CLIENT                 │
│  • JSON Body                             │
│  • HTTP Status Code                      │
│  • Headers                               │
└──────────────────────────────────────────┘
```

---

## Order Processing Workflow

```
START CHECKOUT
     │
     ▼
┌─────────────────────────────────┐
│ 1. VALIDATE CART               │
│    • Cart exists?              │
│    • Has items?                │
│    • Customer info provided?   │
└─────────────────────────────────┘
     │
     ├─ Invalid ──────► ERROR 400
     │
     ▼
┌─────────────────────────────────┐
│ 2. VALIDATE STOCK              │
│    • Each product in stock?    │
│    • Sufficient quantity?      │
└─────────────────────────────────┘
     │
     ├─ Stock Error ──► ERROR 400
     │
     ▼
┌─────────────────────────────────┐
│ 3. CALCULATE TOTALS            │
│    • Subtotal = Σ(price×qty)   │
│    • Tax = Subtotal × 0.10     │
│    • Shipping = $0 or $10      │
│    • Total = Sub + Tax + Ship  │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 4. CREATE ORDER                │
│    • Generate order number     │
│    • Save customer info        │
│    • Save order items          │
│    • Set status: PENDING       │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 5. UPDATE INVENTORY            │
│    • Reduce stock per item     │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 6. SEND CONFIRMATION            │
│    • Generate HTML email       │
│    • Include order details     │
│    • Send via SMTP             │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 7. CLEAR CART                  │
│    • Delete cart items         │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ 8. RETURN SUCCESS              │
│    • Order ID                  │
│    • Order Number              │
│    • Totals                    │
│    • Status                    │
└─────────────────────────────────┘
```

---

## Email Template Structure

```
┌────────────────────────────────────────┐
│         ORDER CONFIRMATION EMAIL       │
├────────────────────────────────────────┤
│                                        │
│  Order Confirmation                    │
│  ─────────────────────────────────────│
│                                        │
│  Dear [Customer Name],                 │
│                                        │
│  Thank you for your order!             │
│                                        │
│  Order Number: [ORDER_NUMBER]          │
│                                        │
│  ─────────────────────────────────────│
│  Items Ordered                         │
│  ─────────────────────────────────────│
│                                        │
│  | Product | Qty | Price | Subtotal | │
│  |----------|-----|-------|----------|│
│  | Item 1   | 2   | $50   | $100     | │
│  | Item 2   | 1   | $30   | $30      | │
│                                        │
│  ─────────────────────────────────────│
│  Order Summary                         │
│  ─────────────────────────────────────│
│                                        │
│  Subtotal:  $130.00                    │
│  Tax (10%): $13.00                     │
│  Shipping:  $10.00                     │
│  ─────────────────────────────────────│
│  Total:     $153.00                    │
│                                        │
│  ─────────────────────────────────────│
│  Shipping Address                      │
│  ─────────────────────────────────────│
│                                        │
│  [SHIPPING_ADDRESS]                    │
│  [SHIPPING_CITY]                       │
│                                        │
│  If you have questions, contact us.   │
│                                        │
│  Best regards,                         │
│  Aircraft Store Team                   │
│                                        │
└────────────────────────────────────────┘
```

---

## Pricing Calculation Example

```
SHOPPING CART CONTENTS
├─ Item 1: Airplane Model A - $99.99 × 1 = $99.99
├─ Item 2: Airplane Model B - $149.99 × 1 = $149.99
└─ Item 3: Airplane Model C - $79.99 × 2 = $159.98
                                              ─────────
                            SUBTOTAL = $409.96

TAX CALCULATION
├─ Tax Rate: 10%
├─ Tax Amount = $409.96 × 0.10
└─ TAX = $41.00

SHIPPING CALCULATION
├─ Subtotal: $409.96
├─ Rule: FREE if > $100, else $10
├─ Result: $409.96 > $100
└─ SHIPPING = $0.00

TOTAL
├─ Subtotal:  $409.96
├─ Tax:       + $41.00
├─ Shipping:  + $0.00
└─ TOTAL:     = $450.96
```

---

## Status Transitions

### Order Status Flow
```
PENDING ──► PROCESSING ──► SHIPPED ──► DELIVERED
  │                                        │
  └────── CANCELLED ─────────────────────┘
              │
              └─────► REFUNDED
```

### Payment Status Flow
```
PENDING ──► PAID
  │          │
  │          └─────► REFUNDED
  │
  └─────► FAILED
```

---

## File Structure Summary

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          ⭐ Email & JWT config
│   │   ├── database.py
│   │   ├── security.py
│   │   └── email.py           ⭐ Email service
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py           ⭐ Customer info stored here
│   │   ├── order_item.py
│   │   └── cart.py            ⭐ New cart models
│   ├── routes/
│   │   ├── auth.py
│   │   ├── product.py         ⭐ Pagination added
│   │   ├── order.py           ⭐ Checkout added
│   │   └── cart.py            ⭐ New cart routes
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── cart.py            ⭐ New schemas
│   └── main.py                ⭐ Cart routes included
├── requirements.txt           ⭐ aiosmtplib added
├── .env.example               ⭐ New config template
├── API_DOCUMENTATION.md       ⭐ Complete API reference
├── IMPLEMENTATION_GUIDE.md    ⭐ Feature guide
├── QUICK_START.md             ⭐ Setup guide
└── REQUIREMENTS_CHECKLIST.md  ⭐ Requirements mapping
```

---

This architecture ensures:
✅ Scalability - Modular design
✅ Security - Role-based access control
✅ Reliability - Database constraints & validation
✅ Performance - Efficient queries & indexing
✅ Maintainability - Clear separation of concerns

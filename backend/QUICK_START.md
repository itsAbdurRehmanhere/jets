# Quick Start Guide

## Prerequisites
- Python 3.8+
- PostgreSQL
- pip

## Setup Steps

### 1. Activate Virtual Environment
```bash
cd d:\jets\backend
# On Windows:
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values:
# - DATABASE_URL (PostgreSQL connection string)
# - SMTP credentials (for email)
# - SECRET_KEY (change from default)
```

### 4. Run the Application
```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

---

## Access Points

### Interactive API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Health Check
```bash
curl http://localhost:8000/health
```

---

## Quick Test Flow

### 1. Register a User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```
Save the `access_token` from the response.

### 3. Browse Products
```bash
curl -X GET "http://localhost:8000/products?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Add to Cart
```bash
curl -X POST http://localhost:8000/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

### 5. View Cart
```bash
curl -X GET http://localhost:8000/cart/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Checkout
```bash
curl -X POST http://localhost:8000/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "5551234567",
    "shipping_address": "123 Main St",
    "shipping_city": "Springfield",
    "customer_notes": "Please be careful",
    "send_confirmation_email": false
  }'
```

### 7. View Your Orders
```bash
curl -X GET "http://localhost:8000/orders/?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Environment Setup Checklist

- [ ] Python virtual environment created and activated
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] PostgreSQL running and database created
- [ ] `.env` file created with correct values
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` configured
- [ ] Application starts without errors: `uvicorn app.main:app --reload`
- [ ] Can access Swagger UI at `http://localhost:8000/docs`

---

## Useful Commands

### Database Operations
```bash
# Connect to PostgreSQL database
psql -U username -d aircraft_store

# Check if tables were created
\dt
```

### Python Debugging
```bash
# Run Python syntax check
python -m py_compile app/main.py

# Check imports
python -c "import app.main"
```

### API Testing Tools
- **Postman**: GUI tool for API testing
- **curl**: Command-line HTTP client
- **Thunder Client**: VS Code extension
- **Swagger UI**: Built-in at `/docs`

---

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database connection
│   │   ├── email.py           # Email utilities ⭐ NEW
│   │   └── security.py        # JWT & password hashing
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   └── cart.py            # ⭐ NEW
│   ├── routes/
│   │   ├── auth.py
│   │   ├── product.py
│   │   ├── order.py           # ⭐ UPDATED with checkout
│   │   └── cart.py            # ⭐ NEW
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── cart.py            # ⭐ NEW
│   ├── main.py                # ⭐ UPDATED with cart routes
│   └── init_db.py
├── .env                        # Environment variables (create from .env.example)
├── .env.example               # ⭐ NEW - Configuration template
├── requirements.txt           # ⭐ UPDATED - Added aiosmtplib
├── API_DOCUMENTATION.md       # ⭐ NEW - Full API reference
├── IMPLEMENTATION_GUIDE.md    # ⭐ NEW - Feature guide
└── QUICK_START.md             # ⭐ This file
```

---

## Key Features

✅ **User Management**
- Register, login, token refresh
- Role-based access (Admin/User)

✅ **Product Browsing**
- Paginated product list
- Category filtering
- Full-text search
- Product details with images

✅ **Shopping Cart**
- Add/remove items
- Adjust quantities
- View cart total
- Persistent cart

✅ **Order Checkout**
- Customer information form
- Automatic calculations (tax, shipping)
- Stock management
- Email confirmations

✅ **Order Management**
- Users view own orders
- Admins view all orders with customer info
- Track order status
- Manage order items

✅ **Email Notifications**
- Order confirmation emails
- Professional HTML templates
- Configurable SMTP

---

## Troubleshooting

### "ModuleNotFoundError"
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### "SQLALCHEMY: Can't find the database"
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Create the database
createdb aircraft_store
```

### "Email not sending"
```bash
# Check SMTP settings in .env
# Verify email account settings
# For Gmail: Enable 2FA and use App Password
```

### "401 Unauthorized"
```bash
# Ensure token is in Authorization header
# Format: Authorization: Bearer YOUR_TOKEN
# Token may have expired (get new one by logging in)
```

---

## Next Steps

1. Test all endpoints using Swagger UI at `/docs`
2. Configure email settings in `.env`
3. Create admin user
4. Add sample products
5. Test checkout flow

For detailed API documentation, see `API_DOCUMENTATION.md`
For implementation details, see `IMPLEMENTATION_GUIDE.md`

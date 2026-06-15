# app/init_db.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.password_reset import PasswordResetToken  # ensures table is created
from app.core.security import hash_password
from app.core.config import DAtABASE_URL
from app.core.database import Base


def create_tables():
    """Create all database tables using the pooler connection"""
    try:
        from app.core.database import engine
        
        # First, set the search_path for this connection
        with engine.connect() as connection:
            connection.execute(text("SET search_path TO public"))
            connection.commit()
        
        # Now create all tables
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Error creating tables: {type(e).__name__}: {str(e)}")
        return False


def create_default_admin():
    """Create default admin user"""
    try:
        from app.core.database import SessionLocal
        
        db = SessionLocal()
        
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@admin.com").first()
        
        if not admin:
            admin_user = User(
                username="Admin",
                email="admin@admin.com",
                password=hash_password("Admin@12345"),
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("[OK] Default admin user created successfully!")
            print(f"   Email: admin@admin.com")
            print(f"   Password: Admin@12345")
        else:
            print("[OK] Admin user already exists")
            
    except Exception as e:
        print(f"[ERROR] Error with admin user: {type(e).__name__}: {str(e)}")
        try:
            db.rollback()
        except:
            pass
    finally:
        try:
            db.close()
        except:
            pass


if __name__ == "__main__":
    create_default_admin()
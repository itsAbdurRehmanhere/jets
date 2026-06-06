from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import DAtABASE_URL

# Create engine with proper configuration for connection pooler
engine = create_engine(
    DAtABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Set search_path on each connection
@event.listens_for(engine, "connect")
def set_search_path(dbapi_conn, connection_record):
    with dbapi_conn.cursor() as cursor:
        cursor.execute("SET search_path TO public")
    dbapi_conn.commit()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
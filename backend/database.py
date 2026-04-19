from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Format: postgresql://<username>:<password>@<host>:<port>/<database_name>
# IMPORTANT: Change "your_password" to your actual PostgreSQL password!
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:pyazkachori@localhost:5432/apex_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
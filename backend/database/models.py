from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)

    # Supabase Auth user ID who owns this case
    user_id = Column(String(255), nullable=False, index=True)

    case_number = Column(String(100), unique=True, nullable=False, index=True)

    title = Column(String(255), nullable=False)

    case_type = Column(String(100), nullable=True)

    description = Column(Text, nullable=True)

    status = Column(
        String(50),
        nullable=False,
        default="active"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
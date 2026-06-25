from __future__ import annotations
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name          = Column(String(200), nullable=False)
    card_name          = Column(String(200), nullable=False)
    last_four          = Column(String(4), nullable=True)
    credit_limit       = Column(Float, nullable=True)
    billing_cycle_day  = Column(Integer, nullable=True)   # day billing cycle closes
    due_date_day       = Column(Integer, nullable=True)   # payment due day of month
    interest_rate      = Column(Float, nullable=True)
    notes              = Column(Text, nullable=True)
    created_at         = Column(DateTime(timezone=True), server_default=func.now())
    updated_at         = Column(DateTime(timezone=True), onupdate=func.now())

    bills = relationship("CreditCardBill", back_populates="card", cascade="all, delete-orphan")


class CreditCardBill(Base):
    __tablename__ = "credit_card_bills"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    card_id        = Column(Integer, ForeignKey("credit_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    billing_month  = Column(Integer, nullable=False)   # 1-12
    billing_year   = Column(Integer, nullable=False)
    bill_amount    = Column(Float, nullable=False)
    minimum_due    = Column(Float, nullable=True)
    due_date       = Column(Date, nullable=True)
    paid_amount    = Column(Float, nullable=True, default=0)
    status         = Column(String(20), default="pending")  # pending / paid / partial
    paid_date      = Column(Date, nullable=True)
    expense_id     = Column(Integer, nullable=True)   # expense created when paid
    notes          = Column(Text, nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    card = relationship("CreditCard", back_populates="bills")

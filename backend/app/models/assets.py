from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Loan(Base):
    __tablename__ = "loans"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    loan_type        = Column(String(50), nullable=False)
    lender           = Column(String(200), nullable=False)
    principal_amount = Column(Float, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    interest_rate    = Column(Float, nullable=True)   # annual %
    emi_amount       = Column(Float, nullable=True)
    tenure_months    = Column(Integer, nullable=True)
    start_date       = Column(Date, nullable=True)
    end_date         = Column(Date, nullable=True)
    notes            = Column(Text, nullable=True)
    status           = Column(String(20), default="active")  # active / closed
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())


class Investment(Base):
    __tablename__ = "investments"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    investment_type = Column(String(20), nullable=False)   # shares / mutual_fund
    name            = Column(String(200), nullable=False)  # company or fund name
    ticker          = Column(String(20), nullable=True)    # for shares
    quantity        = Column(Float, nullable=True)         # shares or MF units
    buy_price       = Column(Float, nullable=True)         # avg buy price / NAV at buy
    current_price   = Column(Float, nullable=True)         # latest price / NAV (user updates)
    total_invested  = Column(Float, nullable=False)
    fund_house      = Column(String(200), nullable=True)   # for mutual funds
    buy_date        = Column(Date, nullable=True)
    notes           = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

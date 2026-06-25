from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.assets import Loan, Investment
from app.schemas.assets import (
    LoanCreate, LoanUpdate, LoanOut, LoanListResponse,
    InvestmentCreate, InvestmentUpdate, InvestmentOut, InvestmentListResponse,
)
from typing import Optional


class LoanService:
    def __init__(self, db: Session):
        self.db = db

    def _get(self, user_id: int, loan_id: int) -> Loan:
        loan = self.db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        return loan

    def create(self, user_id: int, data: LoanCreate) -> LoanOut:
        loan = Loan(user_id=user_id, **data.model_dump())
        self.db.add(loan); self.db.commit(); self.db.refresh(loan)
        return LoanOut.model_validate(loan)

    def list(self, user_id: int) -> LoanListResponse:
        items = self.db.query(Loan).filter(Loan.user_id == user_id).order_by(Loan.created_at.desc()).all()
        return LoanListResponse(items=[LoanOut.model_validate(i) for i in items], total=len(items))

    def update(self, user_id: int, loan_id: int, data: LoanUpdate) -> LoanOut:
        loan = self._get(user_id, loan_id)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(loan, k, v)
        self.db.commit(); self.db.refresh(loan)
        return LoanOut.model_validate(loan)

    def delete(self, user_id: int, loan_id: int) -> None:
        loan = self._get(user_id, loan_id)
        self.db.delete(loan); self.db.commit()


class InvestmentService:
    def __init__(self, db: Session):
        self.db = db

    def _get(self, user_id: int, inv_id: int) -> Investment:
        inv = self.db.query(Investment).filter(Investment.id == inv_id, Investment.user_id == user_id).first()
        if not inv:
            raise HTTPException(status_code=404, detail="Investment not found")
        return inv

    def create(self, user_id: int, data: InvestmentCreate) -> InvestmentOut:
        inv = Investment(user_id=user_id, **data.model_dump())
        self.db.add(inv); self.db.commit(); self.db.refresh(inv)
        return InvestmentOut.model_validate(inv)

    def list(self, user_id: int, investment_type: Optional[str] = None) -> InvestmentListResponse:
        q = self.db.query(Investment).filter(Investment.user_id == user_id)
        if investment_type:
            q = q.filter(Investment.investment_type == investment_type)
        items = q.order_by(Investment.created_at.desc()).all()
        return InvestmentListResponse(items=[InvestmentOut.model_validate(i) for i in items], total=len(items))

    def update(self, user_id: int, inv_id: int, data: InvestmentUpdate) -> InvestmentOut:
        inv = self._get(user_id, inv_id)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(inv, k, v)
        self.db.commit(); self.db.refresh(inv)
        return InvestmentOut.model_validate(inv)

    def delete(self, user_id: int, inv_id: int) -> None:
        inv = self._get(user_id, inv_id)
        self.db.delete(inv); self.db.commit()


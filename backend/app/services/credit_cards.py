from __future__ import annotations
from fastapi import HTTPException
from sqlalchemy.orm import Session
import datetime
from typing import Optional
from app.models.credit_cards import CreditCard, CreditCardBill
from app.models.expense import Expense
from app.schemas.credit_cards import (
    CreditCardCreate, CreditCardUpdate, CreditCardOut, CreditCardListResponse,
    CreditCardBillCreate, CreditCardBillUpdate, BillPaymentCreate,
    CreditCardBillOut, CreditCardBillListResponse,
)

MONTHS = ["January","February","March","April","May","June",
          "July","August","September","October","November","December"]


class CreditCardService:
    def __init__(self, db: Session):
        self.db = db

    def _get_card(self, user_id: int, card_id: int) -> CreditCard:
        card = self.db.query(CreditCard).filter(CreditCard.id == card_id, CreditCard.user_id == user_id).first()
        if not card:
            raise HTTPException(status_code=404, detail="Credit card not found")
        return card

    def _get_bill(self, user_id: int, bill_id: int) -> CreditCardBill:
        bill = self.db.query(CreditCardBill).filter(CreditCardBill.id == bill_id, CreditCardBill.user_id == user_id).first()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        return bill

    # ── Card CRUD ─────────────────────────────────────────────────

    def create_card(self, user_id: int, data: CreditCardCreate) -> CreditCardOut:
        card = CreditCard(user_id=user_id, **data.model_dump())
        self.db.add(card); self.db.commit(); self.db.refresh(card)
        return CreditCardOut.model_validate(card)

    def list_cards(self, user_id: int) -> CreditCardListResponse:
        items = self.db.query(CreditCard).filter(CreditCard.user_id == user_id).order_by(CreditCard.created_at.desc()).all()
        return CreditCardListResponse(items=[CreditCardOut.model_validate(c) for c in items], total=len(items))

    def update_card(self, user_id: int, card_id: int, data: CreditCardUpdate) -> CreditCardOut:
        card = self._get_card(user_id, card_id)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(card, k, v)
        self.db.commit(); self.db.refresh(card)
        return CreditCardOut.model_validate(card)

    def delete_card(self, user_id: int, card_id: int) -> None:
        card = self._get_card(user_id, card_id)
        self.db.delete(card); self.db.commit()

    # ── Bill CRUD ─────────────────────────────────────────────────

    def add_bill(self, user_id: int, data: CreditCardBillCreate) -> CreditCardBillOut:
        self._get_card(user_id, data.card_id)   # verify card belongs to user
        bill = CreditCardBill(user_id=user_id, status="pending", paid_amount=0, **data.model_dump())
        self.db.add(bill); self.db.commit(); self.db.refresh(bill)
        return CreditCardBillOut.model_validate(bill)

    def list_bills(self, user_id: int, card_id: Optional[int] = None) -> CreditCardBillListResponse:
        q = self.db.query(CreditCardBill).filter(CreditCardBill.user_id == user_id)
        if card_id:
            q = q.filter(CreditCardBill.card_id == card_id)
        items = q.order_by(CreditCardBill.billing_year.desc(), CreditCardBill.billing_month.desc()).all()
        return CreditCardBillListResponse(items=[CreditCardBillOut.model_validate(b) for b in items], total=len(items))

    def update_bill(self, user_id: int, bill_id: int, data: CreditCardBillUpdate) -> CreditCardBillOut:
        bill = self._get_bill(user_id, bill_id)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(bill, k, v)
        self.db.commit(); self.db.refresh(bill)
        return CreditCardBillOut.model_validate(bill)

    def delete_bill(self, user_id: int, bill_id: int) -> None:
        bill = self._get_bill(user_id, bill_id)
        self.db.delete(bill); self.db.commit()

    def pay_bill(self, user_id: int, bill_id: int, data: BillPaymentCreate) -> CreditCardBillOut:
        bill = self._get_bill(user_id, bill_id)
        card = bill.card

        paid = data.paid_amount if data.paid_amount is not None else bill.bill_amount
        paid_on = data.paid_date or datetime.date.today()

        label = f"{card.bank_name} {card.card_name} – {MONTHS[bill.billing_month - 1]} {bill.billing_year}"

        expense = Expense(
            user_id=user_id,
            date=paid_on,
            category="Credit Card",
            subcategory=f"{card.bank_name} {card.card_name}",
            amount=paid,
            notes=data.notes or label,
        )
        self.db.add(expense)
        self.db.flush()

        bill.paid_amount = paid
        bill.paid_date   = paid_on
        bill.expense_id  = expense.id
        bill.status      = "paid" if paid >= bill.bill_amount else "partial"

        self.db.commit(); self.db.refresh(bill)
        return CreditCardBillOut.model_validate(bill)

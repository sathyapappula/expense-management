from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.expense import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut, ExpenseListResponse
from app.models.expense import Expense
from typing import Optional
from datetime import date
import math


class ExpenseService:
    def __init__(self, db: Session):
        self.repo = ExpenseRepository(db)

    def create(self, user_id: int, data: ExpenseCreate) -> ExpenseOut:
        expense = Expense(user_id=user_id, **data.model_dump())
        return ExpenseOut.model_validate(self.repo.create(expense))

    def list(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> ExpenseListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.get_by_user(user_id, skip, page_size, search, category, date_from, date_to)
        return ExpenseListResponse(
            items=[ExpenseOut.model_validate(e) for e in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if total else 1,
        )

    def get(self, user_id: int, expense_id: int) -> ExpenseOut:
        expense = self.repo.get_user_expense(user_id, expense_id)
        if not expense:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
        return ExpenseOut.model_validate(expense)

    def update(self, user_id: int, expense_id: int, data: ExpenseUpdate) -> ExpenseOut:
        expense = self.repo.get_user_expense(user_id, expense_id)
        if not expense:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(expense, field, value)
        return ExpenseOut.model_validate(self.repo.update(expense))

    def delete(self, user_id: int, expense_id: int) -> None:
        expense = self.repo.get_user_expense(user_id, expense_id)
        if not expense:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
        self.repo.delete(expense)

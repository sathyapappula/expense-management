from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.expense import Expense
from app.repositories.base import BaseRepository
from typing import Optional, List, Tuple
from datetime import date


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, db: Session):
        super().__init__(Expense, db)

    def get_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> Tuple[List[Expense], int]:
        q = self.db.query(Expense).filter(Expense.user_id == user_id)
        if search:
            q = q.filter(Expense.notes.ilike(f"%{search}%"))
        if category:
            q = q.filter(Expense.category == category)
        if date_from:
            q = q.filter(Expense.date >= date_from)
        if date_to:
            q = q.filter(Expense.date <= date_to)
        total = q.count()
        items = q.order_by(Expense.date.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_user_expense(self, user_id: int, id: int) -> Optional[Expense]:
        return self.db.query(Expense).filter(Expense.user_id == user_id, Expense.id == id).first()

    def total_by_user(self, user_id: int) -> float:
        result = self.db.query(func.sum(Expense.amount)).filter(Expense.user_id == user_id).scalar()
        return result or 0.0

    def total_by_user_month(self, user_id: int, year: int, month: int) -> float:
        result = (
            self.db.query(func.sum(Expense.amount))
            .filter(
                Expense.user_id == user_id,
                extract("year", Expense.date) == year,
                extract("month", Expense.date) == month,
            )
            .scalar()
        )
        return result or 0.0

    def totals_by_category(self, user_id: int) -> List[dict]:
        rows = (
            self.db.query(Expense.category, func.sum(Expense.amount).label("total"))
            .filter(Expense.user_id == user_id)
            .group_by(Expense.category)
            .all()
        )
        return [{"category": r.category, "total": float(r.total)} for r in rows]

    def totals_by_category_month(self, user_id: int, year: int, month: int) -> List[dict]:
        rows = (
            self.db.query(Expense.category, func.sum(Expense.amount).label("total"))
            .filter(
                Expense.user_id == user_id,
                extract("year", Expense.date) == year,
                extract("month", Expense.date) == month,
            )
            .group_by(Expense.category)
            .all()
        )
        return [{"category": r.category, "total": float(r.total)} for r in rows]

    def monthly_totals(self, user_id: int, year: int) -> List[dict]:
        rows = (
            self.db.query(
                extract("month", Expense.date).label("month"),
                func.sum(Expense.amount).label("total"),
            )
            .filter(Expense.user_id == user_id, extract("year", Expense.date) == year)
            .group_by(extract("month", Expense.date))
            .all()
        )
        return [{"month": int(r.month), "total": float(r.total)} for r in rows]

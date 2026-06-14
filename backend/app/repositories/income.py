from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.income import Income
from app.repositories.base import BaseRepository
from typing import Optional, List, Tuple
from datetime import date


class IncomeRepository(BaseRepository[Income]):
    def __init__(self, db: Session):
        super().__init__(Income, db)

    def get_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> Tuple[List[Income], int]:
        q = self.db.query(Income).filter(Income.user_id == user_id)
        if search:
            q = q.filter(Income.source.ilike(f"%{search}%"))
        if date_from:
            q = q.filter(Income.date >= date_from)
        if date_to:
            q = q.filter(Income.date <= date_to)
        total = q.count()
        items = q.order_by(Income.date.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_user_income(self, user_id: int, id: int) -> Optional[Income]:
        return self.db.query(Income).filter(Income.user_id == user_id, Income.id == id).first()

    def total_by_user(self, user_id: int) -> float:
        result = self.db.query(func.sum(Income.amount)).filter(Income.user_id == user_id).scalar()
        return result or 0.0

    def monthly_totals(self, user_id: int, year: int) -> List[dict]:
        rows = (
            self.db.query(
                extract("month", Income.date).label("month"),
                func.sum(Income.amount).label("total"),
            )
            .filter(Income.user_id == user_id, extract("year", Income.date) == year)
            .group_by(extract("month", Income.date))
            .all()
        )
        return [{"month": int(r.month), "total": float(r.total)} for r in rows]

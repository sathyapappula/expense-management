from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.repositories.base import BaseRepository
from typing import Optional, List, Tuple


class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: Session):
        super().__init__(Budget, db)

    def get_by_user_month(self, user_id: int, year: int, month: int) -> List[Budget]:
        return (
            self.db.query(Budget)
            .filter(Budget.user_id == user_id, Budget.year == year, Budget.month == month)
            .all()
        )

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> Tuple[List[Budget], int]:
        q = self.db.query(Budget).filter(Budget.user_id == user_id)
        total = q.count()
        items = q.order_by(Budget.year.desc(), Budget.month.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_user_budget(self, user_id: int, id: int) -> Optional[Budget]:
        return self.db.query(Budget).filter(Budget.user_id == user_id, Budget.id == id).first()

    def get_by_category_month(self, user_id: int, year: int, month: int, category: str) -> Optional[Budget]:
        return (
            self.db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.year == year,
                Budget.month == month,
                Budget.category == category,
            )
            .first()
        )

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.crop import Crop, CropExpense
from typing import List, Tuple


class CropRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, crop: Crop) -> Crop:
        self.db.add(crop)
        self.db.commit()
        self.db.refresh(crop)
        return crop

    def get_by_user(self, user_id: int) -> List[Crop]:
        return self.db.query(Crop).filter(Crop.user_id == user_id).order_by(Crop.start_date.desc()).all()

    def get_user_crop(self, user_id: int, crop_id: int) -> Crop:
        return self.db.query(Crop).filter(Crop.user_id == user_id, Crop.id == crop_id).first()

    def update(self, crop: Crop) -> Crop:
        self.db.commit()
        self.db.refresh(crop)
        return crop

    def delete(self, crop: Crop):
        self.db.delete(crop)
        self.db.commit()

    # Crop expenses
    def add_expense(self, expense: CropExpense) -> CropExpense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def get_expenses(self, crop_id: int) -> List[CropExpense]:
        return self.db.query(CropExpense).filter(CropExpense.crop_id == crop_id).order_by(CropExpense.date.desc()).all()

    def get_expense(self, crop_id: int, expense_id: int) -> CropExpense:
        return self.db.query(CropExpense).filter(CropExpense.crop_id == crop_id, CropExpense.id == expense_id).first()

    def delete_expense(self, expense: CropExpense):
        self.db.delete(expense)
        self.db.commit()

    def total_expenses(self, crop_id: int) -> float:
        result = self.db.query(func.sum(CropExpense.amount)).filter(CropExpense.crop_id == crop_id).scalar()
        return float(result or 0)

    def expenses_by_type(self, crop_id: int):
        return (
            self.db.query(CropExpense.expense_type, func.sum(CropExpense.amount).label("total"))
            .filter(CropExpense.crop_id == crop_id)
            .group_by(CropExpense.expense_type)
            .all()
        )

    def dashboard_summary(self, user_id: int) -> dict:
        crops = self.get_by_user(user_id)
        active_crops = sum(1 for c in crops if c.status == "active")

        # Total invested across ALL crops
        total_investment = (
            self.db.query(func.sum(CropExpense.amount))
            .join(Crop, CropExpense.crop_id == Crop.id)
            .filter(Crop.user_id == user_id)
            .scalar() or 0.0
        )

        # Profit from harvested crops only
        harvested_sale = (
            self.db.query(func.sum(Crop.sale_amount))
            .filter(Crop.user_id == user_id, Crop.status == "harvested")
            .scalar() or 0.0
        )
        harvested_expenses = (
            self.db.query(func.sum(CropExpense.amount))
            .join(Crop, CropExpense.crop_id == Crop.id)
            .filter(Crop.user_id == user_id, Crop.status == "harvested")
            .scalar() or 0.0
        )

        return {
            "active_crops": active_crops,
            "total_crop_investment": round(float(total_investment), 2),
            "crop_profit": round(float(harvested_sale - harvested_expenses), 2),
        }

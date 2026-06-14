from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.crop import CropRepository
from app.schemas.crop import CropCreate, CropUpdate, CropExpenseCreate, CropOut, CropExpenseOut, CropListResponse
from app.models.crop import Crop, CropExpense
from typing import List


class CropService:
    def __init__(self, db: Session):
        self.repo = CropRepository(db)

    def _enrich(self, crop: Crop) -> CropOut:
        expenses = self.repo.get_expenses(crop.id)
        total_exp = sum(e.amount for e in expenses)
        net_profit = crop.sale_amount - total_exp
        roi = (net_profit / total_exp * 100) if total_exp > 0 else 0.0
        return CropOut(
            id=crop.id,
            user_id=crop.user_id,
            name=crop.name,
            crop_type=crop.crop_type,
            area_acres=crop.area_acres,
            start_date=crop.start_date,
            expected_harvest_date=crop.expected_harvest_date,
            actual_harvest_date=crop.actual_harvest_date,
            status=crop.status,
            sale_amount=crop.sale_amount,
            notes=crop.notes,
            created_at=crop.created_at,
            total_expenses=round(total_exp, 2),
            net_profit=round(net_profit, 2),
            roi_pct=round(roi, 1),
            expenses=[CropExpenseOut.model_validate(e) for e in expenses],
        )

    def create(self, user_id: int, data: CropCreate) -> CropOut:
        crop = Crop(user_id=user_id, **data.model_dump())
        return self._enrich(self.repo.create(crop))

    def list(self, user_id: int) -> CropListResponse:
        crops = self.repo.get_by_user(user_id)
        return CropListResponse(items=[self._enrich(c) for c in crops], total=len(crops))

    def get(self, user_id: int, crop_id: int) -> CropOut:
        crop = self.repo.get_user_crop(user_id, crop_id)
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        return self._enrich(crop)

    def update(self, user_id: int, crop_id: int, data: CropUpdate) -> CropOut:
        crop = self.repo.get_user_crop(user_id, crop_id)
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(crop, field, value)
        return self._enrich(self.repo.update(crop))

    def delete(self, user_id: int, crop_id: int):
        crop = self.repo.get_user_crop(user_id, crop_id)
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        self.repo.delete(crop)

    def add_expense(self, user_id: int, crop_id: int, data: CropExpenseCreate) -> CropOut:
        crop = self.repo.get_user_crop(user_id, crop_id)
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        expense = CropExpense(crop_id=crop_id, user_id=user_id, **data.model_dump())
        self.repo.add_expense(expense)
        return self._enrich(crop)

    def delete_expense(self, user_id: int, crop_id: int, expense_id: int):
        crop = self.repo.get_user_crop(user_id, crop_id)
        if not crop:
            raise HTTPException(status_code=404, detail="Crop not found")
        expense = self.repo.get_expense(crop_id, expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        self.repo.delete_expense(expense)

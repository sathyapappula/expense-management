from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.crop import CropCreate, CropUpdate, CropExpenseCreate, CropOut, CropListResponse
from app.services.crop import CropService
from app.models.user import User

router = APIRouter()


@router.get("", response_model=CropListResponse)
def list_crops(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CropService(db).list(current_user.id)


@router.post("", response_model=CropOut, status_code=201)
def create_crop(data: CropCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CropService(db).create(current_user.id, data)


@router.get("/{crop_id}", response_model=CropOut)
def get_crop(crop_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CropService(db).get(current_user.id, crop_id)


@router.put("/{crop_id}", response_model=CropOut)
def update_crop(crop_id: int, data: CropUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CropService(db).update(current_user.id, crop_id, data)


@router.delete("/{crop_id}", status_code=204)
def delete_crop(crop_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    CropService(db).delete(current_user.id, crop_id)


@router.post("/{crop_id}/expenses", response_model=CropOut, status_code=201)
def add_crop_expense(crop_id: int, data: CropExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CropService(db).add_expense(current_user.id, crop_id, data)


@router.delete("/{crop_id}/expenses/{expense_id}", status_code=204)
def delete_crop_expense(crop_id: int, expense_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    CropService(db).delete_expense(current_user.id, crop_id, expense_id)

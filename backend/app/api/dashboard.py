from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardService
from app.models.user import User

router = APIRouter()


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard summary with charts data."""
    return DashboardService(db).get_dashboard(current_user.id)

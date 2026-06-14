from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.reports import ReportService
from app.models.user import User

router = APIRouter()


@router.get("/download")
def download_report(
    format: str = Query(..., description="Export format: csv, excel, pdf"),
    report_type: str = Query("monthly", description="Report type: daily, weekly, monthly, yearly"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download financial report in CSV, Excel, or PDF format."""
    svc = ReportService(db)
    fmt = format.lower()
    if fmt == "csv":
        data = svc.generate_csv(current_user.id, report_type, date_from, date_to)
        return Response(
            content=data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=report_{report_type}.csv"},
        )
    elif fmt == "excel":
        data = svc.generate_excel(current_user.id, report_type, date_from, date_to)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=report_{report_type}.xlsx"},
        )
    elif fmt == "pdf":
        data = svc.generate_pdf(current_user.id, report_type, date_from, date_to)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=report_{report_type}.pdf"},
        )
    else:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid format. Use csv, excel, or pdf")

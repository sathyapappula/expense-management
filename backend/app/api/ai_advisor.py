from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User
from app.services.ai_advisor import build_financial_snapshot, ask_groq

router = APIRouter()


class AIQuestion(BaseModel):
    question: str


class AIAnswer(BaseModel):
    answer: str


@router.post("/ask", response_model=AIAnswer)
def ask_ai(body: AIQuestion, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your-groq-api-key-here":
        raise HTTPException(
            status_code=503,
            detail="AI advisor is not configured. Get a free API key at console.groq.com and add GROQ_API_KEY to the backend .env file.",
        )

    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    snapshot  = build_financial_snapshot(db, current_user.id)
    answer    = ask_groq(snapshot, body.question.strip(), settings.GROQ_API_KEY)

    return AIAnswer(answer=answer)

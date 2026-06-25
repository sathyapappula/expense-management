from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, dashboard, income, expenses, budgets, reports, crops, assets, credit_cards, ai_advisor


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Personal Finance Management System — production-ready REST API",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

app.include_router(auth.router,      prefix=f"{PREFIX}/auth",      tags=["Authentication"])
app.include_router(dashboard.router, prefix=f"{PREFIX}/dashboard", tags=["Dashboard"])
app.include_router(income.router,    prefix=f"{PREFIX}/income",    tags=["Income"])
app.include_router(expenses.router,  prefix=f"{PREFIX}/expenses",  tags=["Expenses"])
app.include_router(budgets.router,   prefix=f"{PREFIX}/budgets",   tags=["Budgets"])
app.include_router(reports.router,   prefix=f"{PREFIX}/reports",   tags=["Reports"])
app.include_router(crops.router,     prefix=f"{PREFIX}/crops",     tags=["Crops"])
app.include_router(assets.router,       prefix=f"{PREFIX}/assets",        tags=["Assets"])
app.include_router(credit_cards.router, prefix=f"{PREFIX}/credit-cards",  tags=["Credit Cards"])
app.include_router(ai_advisor.router,   prefix=f"{PREFIX}/ai",             tags=["AI Advisor"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}

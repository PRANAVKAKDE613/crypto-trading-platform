from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import subprocess

from app.core.config import settings
from app.routers import auth, api_keys, trading, bot


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME}...")
    subprocess.run(["alembic", "upgrade", "head"], check=True)
    yield
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ✅ Proper CORS setup (ONLY this, no custom middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://athletic-alignment-production-c07e.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])
app.include_router(trading.router, prefix="/trading", tags=["trading"])
app.include_router(bot.router, prefix="/bot", tags=["bot"])
"""JalRaksha Backend — FastAPI application entry point."""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import validation, assessment, health_card

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="JalRaksha API",
    description="Backend API for JalRaksha — Citizen Infrastructure Health Mapping Platform",
    version="1.0.0",
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(validation.router, prefix="/api", tags=["Validation"])
app.include_router(assessment.router, prefix="/api", tags=["Assessment"])
app.include_router(health_card.router, prefix="/api", tags=["Demo Data"])


@app.get("/api/health")
async def health_check():
    """Simple backend health endpoint."""
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    return {
        "status": "healthy",
        "service": "JalRaksha API",
        "version": "1.0.0",
        "gemini_configured": bool(gemini_key and gemini_key != "your_gemini_api_key_here"),
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)

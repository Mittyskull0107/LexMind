from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, engine
from database import models
from api.cases import router as cases_router
from api.chat import router as chat_router
from api.memory import router as memory_router
from auth.dependencies import get_current_user
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LexMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router)
app.include_router(memory_router)
app.include_router(chat_router)
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "LexMind API"
    }
@app.get("/api/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "message": "Authentication successful",
        "user": current_user
    }
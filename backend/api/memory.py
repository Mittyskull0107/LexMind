from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Case
from auth.dependencies import get_current_user

from services.hindsight_service import (
    create_case_memory_bank,
    add_memory as store_memory,
    recall_memory
)


router = APIRouter(
    prefix="/api/memory",
    tags=["Memory"]
)


@router.get("/")
def get_memory():
    return {
        "message": "Memory system is working"
    }


@router.get("/{case_id}")
async def get_case_memory(
    case_id: int,
    query: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    case = (
        db.query(Case)
        .filter(
            Case.id == case_id,
            Case.user_id == current_user["id"]
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    memories = await recall_memory(
        case_id,
        query
    )

    return {
        "case_id": case_id,
        "memories": memories
    }


@router.post("/{case_id}")
async def add_case_memory(
    case_id: int,
    memory: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    case = (
        db.query(Case)
        .filter(
            Case.id == case_id,
            Case.user_id == current_user["id"]
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    await create_case_memory_bank(case_id)

    result = await store_memory(
        case_id,
        memory
    )

    return {
        "case_id": case_id,
        "memory": memory,
        "message": "Memory stored successfully",
        "hindsight": result
    }
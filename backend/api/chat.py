from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Case
from auth.dependencies import get_current_user

from services.hindsight_service import recall_memory
from services.openai_service import generate_answer


router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"]
)


@router.post("/{case_id}")
async def chat(
    case_id: int,
    message: str,
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
        message
    )

    answer = await generate_answer(
        message,
        str(memories)
    )

    return {
        "case_id": case_id,
        "question": message,
        "answer": answer,
        "memories_used": memories
    }
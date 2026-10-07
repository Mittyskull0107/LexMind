from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Case
from auth.dependencies import get_current_user

router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"]
)


@router.post("/")
def create_case(
    case_number: str,
    title: str,
    case_type: str | None = None,
    description: str | None = None,
    status: str = "active",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_case = Case(
        user_id=current_user["id"],
        case_number=case_number,
        title=title,
        case_type=case_type,
        description=description,
        status=status
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return new_case


@router.get("/")
def get_cases(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(Case)
        .filter(Case.user_id == current_user["id"])
        .all()
    )


@router.get("/{case_id}")
def get_case(
    case_id: int,
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

    return case


@router.put("/{case_id}")
def update_case(
    case_id: int,
    title: str,
    case_type: str | None = None,
    description: str | None = None,
    status: str = "active",
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

    case.title = title
    case.case_type = case_type
    case.description = description
    case.status = status

    db.commit()
    db.refresh(case)

    return case


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
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

    db.delete(case)
    db.commit()

    return {
        "message": "Case deleted successfully"
    }
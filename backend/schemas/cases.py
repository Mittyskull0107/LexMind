from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseBase(BaseModel):
    case_number: str
    title: str
    case_type: str | None = None
    description: str | None = None
    status: str = "active"


class CaseCreate(CaseBase):
    pass


class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
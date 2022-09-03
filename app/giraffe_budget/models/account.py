from ..utils.time_utils import is_valid_date
from pydantic import BaseModel, validator

class CreateAccountModel(BaseModel):
    name: str
    notes: str
    credit_card: bool
    starting_balance: int


class ReconcileAccountModel(BaseModel):
    balance: int
    date: str
    
    @validator("date")
    def validate_date(cls, v):
        is_valid_date(v)
        return v

from ..utils.time_utils import is_valid_date
from pydantic import BaseModel, validator
from typing import Optional

class CreateTransferModel(BaseModel):
    from_account_id: str
    to_account_id: str
    amount: int
    memo: Optional[str]
    cleared: bool
    date: str
   
    @validator("amount")
    def validate_amount(cls, v):
        assert v > 0, "Amount must be a positive integer"
        return v

    @validator("date")
    def validate_date(cls, v):
        return is_valid_date(v)

class UpdateTransferModel(BaseModel):
    from_account_id: Optional[str]
    to_account_id: Optional[str]
    amount: Optional[int]
    memo: Optional[str]
    cleared: Optional[bool]
    date: Optional[str]
    
    @validator("date")
    def validate_date(cls, v):
        return is_valid_date(v)


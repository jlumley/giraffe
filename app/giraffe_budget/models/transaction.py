from ..utils.time_utils import is_valid_date
from pydantic import BaseModel, validator
from typing import List, Optional

class CategoryModel(BaseModel):
    category_id: str
    amount: int

class CreateTransactionModel(BaseModel):
    account_id: str
    payee_id: Optional[str]
    memo: Optional[str]
    cleared: bool
    date: str
    categories: List[CategoryModel]

    @validator("date")
    def validate_date(cls, v):
        return is_valid_date(v)

class UpdateTransactionModel(BaseModel):
    account_id: Optional[str]
    payee_id: Optional[str]
    memo: Optional[str]
    cleared: Optional[bool]
    date: Optional[str]
    categories: Optional[List[CategoryModel]]
    
    @validator("date")
    def validate_date(cls, v):
        return is_valid_date(v)


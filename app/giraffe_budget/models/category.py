from ..utils.time_utils import is_valid_date
from pydantic import BaseModel, validator
from typing import Optional

class CreateCategoryModel(BaseModel):
    name: str
    group: str
    notes = ""
    category_type = "budget"
    credit_card = False
    starting_balance = 0


class CategoryAssignMoneyModel(BaseModel):
    amount: int
    date: str
    
    @validator("amount")
    def validate_amounts(cls, v):
        return abs(int)

    @validator("date")
    def validate_date(cls, v):
        return is_valid_date(v)

class GetCategoriesQueryParamsModel(BaseModel):
    group: Optional[str]

class UpdateCategoryModel(BaseModel):
    name: Optional[str]
    group: Optional[str]
    notes: Optional[str]


class UpdateCategorySavingsTargetModel(BaseModel):
    target_date: str
    target_amount: int 
    
    @validator("target_date")
    def validate_date(cls, v):
        return is_valid_date(v)

class UpdateCategoryMonthlySavingsTargetModel(BaseModel):
    target_amount: int 

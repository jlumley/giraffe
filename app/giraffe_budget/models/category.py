from ..utils.time_utils import is_valid_date
from enum import Enum
from pydantic import BaseModel, validator
from typing import Optional

class CategoryType(Enum):
    Budget: "budget"

class TargetType(Enum):
    monthly_savings: "monthly_savings" 
    savings_target: "savings_target"
    spending_target: "spending_target"

class CreateCategoryModel(BaseModel):
    name: str
    group: str
    notes: Optional[str] = ""
    category_type: CategoryType = "budget"
    
class UpdateCategoryModel(BaseModel):
    name: Optional[str]
    group: Optional[str]
    notes: Optional[str]

class GetCategoriesQueryParamsModel(BaseModel):
    group: Optional[str]

class CategoryAssignMoneyModel(BaseModel):
    amount: int
    date: Optional[str]
    
    @validator("amount")
    def validate_amount(cls, v):
        return abs(v)
   
    @validator("date")
    def validate_date(cls, v):
        return is_valid_date(v)

class UpdateCategoryTargetModel(BaseModel):
    target_type: TargetType
    target_amount: int
    target_date: Optional[str]
    
    @validator("target_date")
    def validate_date(cls, v):
        return is_valid_date(v)


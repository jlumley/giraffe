from ..utils.time_utils import is_valid_date
from pydantic import BaseModel, validator
from typing import List, Optional

class ReportsQueryParamsModel(BaseModel):
    start_date: Optional[str]
    end_date: Optional[str]
    
    @validator("end_date")
    def validate_end_date(cls, v):
        return is_valid_date(v)

    @validator("start_date")
    def validate_start_date(cls, v):
        return is_valid_date(v)


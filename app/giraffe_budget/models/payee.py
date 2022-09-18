from pydantic import BaseModel

class CreatePayeeModel(BaseModel):
    name: str

class UpdatePayeeModel(BaseModel):
    name: str

from pydantic import BaseModel
from typing import Optional

class ProjectRequest(BaseModel):
    name: str
    description: str
    target_deadline: str

class OverdueCheckRequest(BaseModel):
    simulated_today: str
    project_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

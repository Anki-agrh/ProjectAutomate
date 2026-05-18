from pydantic import BaseModel
from typing import Optional, List

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

class ChangePasswordRequest(BaseModel):
    email: str
    old_password: str
    new_password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    domain: Optional[str] = "Management"
    skills: Optional[List[str]] = ["Management", "Leadership"]
    experience: Optional[int] = 5

class EmployeeCreateRequest(BaseModel):
    name: str
    email: str
    role: Optional[str] = "employee"
    domain: str
    skills: List[str]
    experience: int

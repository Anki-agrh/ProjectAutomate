from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    user_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String)
    domain = Column(String)
    skills = Column(JSONB) 
    experience = Column(Integer)
    avg_quality_score = Column(Float)
    reliability_score = Column(Integer)
    
    # MULTI-TENANCY: The manager this employee belongs to
    manager_id = Column(String, ForeignKey("employees.user_id"), nullable=True)

    # This creates a virtual link to the Tables
    tasks = relationship("Task", back_populates="assigned_employee")
    performance_history = relationship("ReliabilityHistory", back_populates="employee", cascade="all, delete-orphan")

class ReliabilityHistory(Base):
    __tablename__ = "reliability_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("employees.user_id"))
    score = Column(Integer)
    recorded_at = Column(String) # Store as "YYYY-MM-DD"

    employee = relationship("Employee", back_populates="performance_history")

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    status = Column(String, default="Planning") # Planning, Active, Completed

    # MULTI-TENANCY: The manager this project belongs to
    manager_id = Column(String, ForeignKey("employees.user_id"), nullable=True)

    # Link to all tasks inside this project
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(String, primary_key=True, index=True)
    title = Column(String)
    required_skills = Column(JSONB) # The skills the AI says are needed
    status = Column(String, default="Unassigned") # Unassigned, In Progress, Review, Done
    assignment_reason = Column(String, nullable=True)

    estimated_days = Column(Integer, nullable=True)
    deadline_date = Column(String, nullable=True)
    
    
    # FOREIGN KEYS: This is how relational databases link data!
    project_id = Column(String, ForeignKey("projects.project_id"))
    assigned_to = Column(String, ForeignKey("employees.user_id"), nullable=True) # Nullable because it starts unassigned

    # Relationships to easily fetch the full Project or Employee data later
    project = relationship("Project", back_populates="tasks")
    assigned_employee = relationship("Employee", back_populates="tasks")
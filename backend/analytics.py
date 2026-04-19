from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/skill-gap")
def get_skill_gap(db: Session = Depends(get_db)):
    """Returns a comparison of required skills vs available bench skills."""
    # 1. Get all required skills from active (non-completed) tasks
    active_tasks = db.query(models.Task).filter(models.Task.status != "Completed").all()
    required_skills_counts = {}
    for task in active_tasks:
        for skill in (task.required_skills or []):
            required_skills_counts[skill] = required_skills_counts.get(skill, 0) + 1
            
    # 2. Get all available skills from employees who have NO active tasks
    busy_employee_ids = [t.assigned_to for t in active_tasks if t.assigned_to]
    idle_employees = db.query(models.Employee).all()
    available_skills_counts = {}
    for emp in idle_employees:
        if emp.user_id not in busy_employee_ids:
            for skill in (emp.skills or []):
                available_skills_counts[skill] = available_skills_counts.get(skill, 0) + 1
                
    # 3. Format for radar/bar chart
    all_skills = set(list(required_skills_counts.keys()) + list(available_skills_counts.keys()))
    chart_data = []
    for skill in all_skills:
        chart_data.append({
            "skill": skill,
            "required": required_skills_counts.get(skill, 0),
            "available": available_skills_counts.get(skill, 0)
        })
        
    return chart_data

@router.get("/employee-growth/{user_id}")
def get_employee_growth(user_id: str, db: Session = Depends(get_db)):
    """Returns the historical reliability score snapshots for an employee."""
    history = db.query(models.ReliabilityHistory).filter(
        models.ReliabilityHistory.user_id == user_id
    ).order_by(models.ReliabilityHistory.recorded_at).all()
    
    return [
        {"date": h.recorded_at, "score": h.score} for h in history
    ]

@router.get("/gantt/{project_id}")
def get_project_gantt(project_id: str, db: Session = Depends(get_db)):
    """Returns task data formatted for a timeline view."""
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    
    gantt_data = []
    # In a real app, we'd have a start_date. For now, we use a mock start date 
    # relative to today or the first task.
    base_date = datetime.now()
    
    for task in tasks:
        # Simple logical ordering based on name or UUID for now
        # Ideally would be based on dependencies
        gantt_data.append({
            "id": task.task_id,
            "name": task.title,
            "start": (base_date).strftime("%Y-%m-%d"),
            "end": task.deadline_date,
            "progress": 100 if task.status == "Completed" else 0,
            "dependencies": [],
            "assigned_to": task.assigned_employee.name if task.assigned_employee else "Unassigned"
        })
        
    return gantt_data

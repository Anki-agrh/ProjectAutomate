from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from datetime import datetime, timedelta
from typing import List, Dict
from dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/skill-gap")
def get_skill_gap(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    """Returns a comparison of required skills vs available bench skills."""
    # 1. Get all required skills from active (non-completed) tasks
    active_tasks = db.query(models.Task).join(models.Project).filter(
        models.Task.status != "Completed",
        models.Project.manager_id == current_user.user_id
    ).all()
    required_skills_counts = {}
    skill_names = {} # Map normalized lower case to original case
    
    for task in active_tasks:
        for skill in (task.required_skills or []):
            skill_norm = skill.strip().lower()
            if skill_norm not in skill_names:
                skill_names[skill_norm] = skill.strip()
            required_skills_counts[skill_norm] = required_skills_counts.get(skill_norm, 0) + 1
            
    # 2. Get all available skills from employees who have NO active tasks
    busy_employee_ids = [t.assigned_to for t in active_tasks if t.assigned_to]
    idle_employees = db.query(models.Employee).filter(
        models.Employee.manager_id == current_user.user_id,
        models.Employee.role != "manager"
    ).all()
    available_skills_counts = {}
    for emp in idle_employees:
        if emp.user_id not in busy_employee_ids:
            for skill in (emp.skills or []):
                skill_norm = skill.strip().lower()
                if skill_norm not in skill_names:
                    skill_names[skill_norm] = skill.strip()
                available_skills_counts[skill_norm] = available_skills_counts.get(skill_norm, 0) + 1
                
    # 3. Format for radar/bar chart
    all_skills = set(list(required_skills_counts.keys()) + list(available_skills_counts.keys()))
    chart_data = []
    for skill_norm in all_skills:
        chart_data.append({
            "skill": skill_names.get(skill_norm, skill_norm),
            "required": required_skills_counts.get(skill_norm, 0),
            "available": available_skills_counts.get(skill_norm, 0)
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
def get_project_gantt(project_id: str, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    """Returns task data formatted for a timeline view."""
    tasks = db.query(models.Task).join(models.Project).filter(
        models.Task.project_id == project_id,
        models.Project.manager_id == current_user.user_id
    ).all()
    
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

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    """Returns comprehensive analytics data for the System Analytics dashboard."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    three_days_str = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    
    # --- All employees ---
    all_employees = db.query(models.Employee).filter(
        models.Employee.manager_id == current_user.user_id,
        models.Employee.role != "manager"
    ).all()
    total_employees = len(all_employees)
    
    # --- All tasks ---
    all_tasks = db.query(models.Task).join(models.Project).filter(
        models.Project.manager_id == current_user.user_id
    ).all()
    active_tasks = [t for t in all_tasks if t.status != "Completed"]
    completed_tasks = [t for t in all_tasks if t.status == "Completed"]
    
    # --- Avg reliability ---
    scores = [e.reliability_score for e in all_employees if e.reliability_score is not None]
    avg_reliability = round(sum(scores) / len(scores), 1) if scores else 0
    
    # --- Overdue tasks ---
    overdue_tasks = [t for t in active_tasks if t.deadline_date and t.deadline_date < today_str]
    due_soon_tasks = [t for t in active_tasks if t.deadline_date and today_str <= t.deadline_date <= three_days_str]
    on_track_tasks = [t for t in active_tasks if t.deadline_date and t.deadline_date > three_days_str]
    
    # --- KPIs ---
    kpis = {
        "total_employees": total_employees,
        "active_tasks": len(active_tasks),
        "completed_tasks": len(completed_tasks),
        "overdue_tasks": len(overdue_tasks),
        "avg_reliability": avg_reliability
    }
    
    # --- Project health (completion % per project) ---
    projects = db.query(models.Project).filter(models.Project.manager_id == current_user.user_id).all()
    project_health = []
    for proj in projects:
        proj_tasks = [t for t in all_tasks if t.project_id == proj.project_id]
        total = len(proj_tasks)
        done = len([t for t in proj_tasks if t.status == "Completed"])
        pct = round((done / total) * 100) if total > 0 else 0
        project_health.append({
            "name": proj.name,
            "total_tasks": total,
            "completed_tasks": done,
            "completion_pct": pct
        })
    
    # --- Deadline risk (tasks with their deadline status) ---
    deadline_risk = []
    for t in active_tasks:
        if not t.deadline_date:
            continue
        if t.deadline_date < today_str:
            status = "overdue"
        elif t.deadline_date <= three_days_str:
            status = "due_soon"
        else:
            status = "on_track"
        
        emp_name = t.assigned_employee.name if t.assigned_employee else "Unassigned"
        deadline_risk.append({
            "task": t.title,
            "deadline": t.deadline_date,
            "status": status,
            "employee": emp_name
        })
    
    # --- Domain distribution ---
    domain_counts = {}
    for emp in all_employees:
        d = emp.domain or "Unknown"
        domain_counts[d] = domain_counts.get(d, 0) + 1
    domain_data = [{"domain": d, "count": c} for d, c in sorted(domain_counts.items(), key=lambda x: x[1], reverse=True)]
    
    return {
        "kpis": kpis,
        "project_health": project_health,
        "deadline_risk": deadline_risk,
        "deadline_summary": {
            "overdue": len(overdue_tasks),
            "due_soon": len(due_soon_tasks),
            "on_track": len(on_track_tasks)
        },
        "domain_distribution": domain_data
    }


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models
from database import get_db

router = APIRouter()

@router.get("/manager/dashboard")
def get_manager_dashboard(db: Session = Depends(get_db)):
    total_projects = db.query(models.Project).count()
    
    active_tasks_query = db.query(models.Task).filter(models.Task.status != "Completed")
    total_active_tasks = active_tasks_query.count()
    
    today_obj = datetime.now()
    three_days_from_now = today_obj + timedelta(days=3)
    
    today_str = today_obj.strftime("%Y-%m-%d")
    three_days_str = three_days_from_now.strftime("%Y-%m-%d")
    
    tasks_due_soon = active_tasks_query.filter(
        models.Task.deadline_date >= today_str,
        models.Task.deadline_date <= three_days_str
    ).all()
    
    due_soon_list = [{
        "task": t.title,
        "deadline": t.deadline_date,
        "assigned_to": t.assigned_employee.name if t.assigned_employee else "Unassigned"
    } for t in tasks_due_soon]
    
    reassigned_tasks = db.query(models.Task).filter(
        models.Task.assignment_reason.like("%[REASSIGNED%")
    ).all()
    
    reassignment_list = [{
        "task": t.title,
        "reason": t.assignment_reason
    } for t in reassigned_tasks]
    
    busy_employee_ids = [task.assigned_to for task in active_tasks_query.all() if task.assigned_to]
    
    idle_employees = db.query(models.Employee).all()
    bench_list = []
    available_skills = {}
    
    for emp in idle_employees:
        if emp.user_id not in busy_employee_ids:
            bench_list.append({
                "name": emp.name,
                "reliability_score": emp.reliability_score or 100,
                "skills": emp.skills
            })
            
            if emp.skills:
                for skill in emp.skills:
                    available_skills[skill] = available_skills.get(skill, 0) + 1
    
    return {
        "status": "success",
        "timestamp": today_obj.strftime("%Y-%m-%d %H:%M:%S"),
        "overview": {
            "total_projects": total_projects,
            "total_active_tasks": total_active_tasks,
            "total_employees_on_bench": len(bench_list) 
        },
        "alerts": {
            "tasks_due_soon_count": len(due_soon_list),
            "tasks_due_soon": due_soon_list
        },
        "bench_report": bench_list, 
        "available_bench_skills": available_skills,
        "recent_activity": {
            "reassignments_count": len(reassignment_list),
            "reassignments": reassignment_list
        }
    }

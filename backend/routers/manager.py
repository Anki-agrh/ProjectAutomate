from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models
from database import get_db
from dependencies import get_current_user

router = APIRouter()

@router.get("/manager/dashboard")
def get_manager_dashboard(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    projects_query = db.query(models.Project).filter(models.Project.manager_id == current_user.user_id)
    total_projects = projects_query.count()
    
    active_tasks_query = db.query(models.Task).join(models.Project).filter(
        models.Task.status != "Completed",
        models.Project.manager_id == current_user.user_id
    )
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
    
    reassigned_tasks = db.query(models.Task).join(models.Project).filter(
        models.Task.assignment_reason.like("%[REASSIGNED%"),
        models.Project.manager_id == current_user.user_id
    ).all()
    
    reassignment_list = [{
        "task": t.title,
        "reason": t.assignment_reason
    } for t in reassigned_tasks]
    
    active_tasks = active_tasks_query.all()
    workload_map = {}
    for t in active_tasks:
        if t.assigned_to:
            workload_map[t.assigned_to] = workload_map.get(t.assigned_to, 0) + 1
            
    busy_employee_ids = list(workload_map.keys())
    
    all_employees = db.query(models.Employee).filter(
        models.Employee.manager_id == current_user.user_id,
        models.Employee.role != "manager"
    ).all()
    
    bench_list = []
    available_skills = {}
    overloaded_workforce = []
    
    for emp in all_employees:
        if emp.user_id not in busy_employee_ids:
            bench_list.append({
                "name": emp.name,
                "reliability_score": emp.reliability_score or 100,
                "skills": emp.skills
            })
            
            if emp.skills:
                for skill in emp.skills:
                    available_skills[skill] = available_skills.get(skill, 0) + 1
        else:
            overloaded_workforce.append({
                "name": emp.name,
                "tasks": workload_map.get(emp.user_id, 0),
                "role": emp.domain or "Employee"
            })
            
    overloaded_workforce.sort(key=lambda x: x["tasks"], reverse=True)
    
    bench_size = len(bench_list)
    system_alert = None
    if bench_size == 0 and len(all_employees) > 0:
        system_alert = "CRITICAL CAPACITY: Bench is empty! Your workforce is fully saturated. Consider recruiting new employees or pausing project intake to manage workload effectively."

    
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
        },
        "system_alert": system_alert,
        "overloaded_workforce": overloaded_workforce if bench_size == 0 else []
    }

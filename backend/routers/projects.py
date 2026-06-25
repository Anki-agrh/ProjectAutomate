from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import models
from database import get_db
from schemas import ProjectRequest
from ai_planner import break_down_project
from assignment import find_best_employee
from datetime import datetime, timedelta
from dependencies import get_current_user

router = APIRouter()

@router.get("/projects")
def get_projects(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    return db.query(models.Project).filter(models.Project.manager_id == current_user.user_id).all()

@router.post("/generate-project")
def create_and_assign_project(request: ProjectRequest, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    new_project_id = str(uuid.uuid4())
    
    # Generate roadmap first before saving anything to DB
    ai_phases = break_down_project(request.description)
    global_workload_tracker = {}
    
    # Calculate bench size dynamically
    total_emps = db.query(models.Employee).filter(
        models.Employee.manager_id == current_user.user_id,
        models.Employee.role != "manager"
    ).count()

    all_active_tasks = db.query(models.Task).join(models.Project).filter(
        models.Task.status != "Completed",
        models.Project.manager_id == current_user.user_id
    ).all()
    
    for active_task in all_active_tasks:
        if active_task.assigned_to:
            if active_task.assigned_to not in global_workload_tracker:
                global_workload_tracker[active_task.assigned_to] = {"tasks": 0, "projects": set()}
            global_workload_tracker[active_task.assigned_to]["tasks"] += 1
            global_workload_tracker[active_task.assigned_to]["projects"].add(active_task.project_id)
            
    busy_emps = len(global_workload_tracker.keys())
    bench_size = max(0, total_emps - busy_emps)
    
    project_hierarchy = []
    freshers_hired_for_project = 0 
    
    for phase in ai_phases:
        phase_title = phase.get("phase_title") or phase.get("title") or "Unnamed Phase"
        current_phase_tasks = [] 
        
        for task_data in phase.get("subtasks", []):
            task_skills = task_data.get("required_skills", [])
            needs_fresher = freshers_hired_for_project < 2
            
            best_emp, ai_explanation = find_best_employee(db, task_skills, global_workload_tracker, force_fresher=needs_fresher, manager_id=current_user.user_id, bench_size=bench_size, current_project_id=new_project_id)
            
            if not best_emp and needs_fresher:
                best_emp, ai_explanation = find_best_employee(db, task_skills, global_workload_tracker, force_fresher=False, manager_id=current_user.user_id, bench_size=bench_size, current_project_id=new_project_id)
                if best_emp:
                    ai_explanation = "[FALLBACK: No fresher had the skills] " + ai_explanation
            
            if best_emp and best_emp.experience <= 2:
                freshers_hired_for_project += 1
            
            emp_id = best_emp.user_id if best_emp else None
            emp_name = best_emp.name if best_emp else "Unassigned (Needs Manual Review)"
            
            if emp_id:
                if emp_id not in global_workload_tracker:
                    global_workload_tracker[emp_id] = {"tasks": 0, "projects": set()}
                global_workload_tracker[emp_id]["tasks"] += 1
                global_workload_tracker[emp_id]["projects"].add(new_project_id)
                
                # If we just assigned someone new to a task and they weren't busy, bench size drops!
                if global_workload_tracker[emp_id]["tasks"] == 1:
                    bench_size = max(0, bench_size - 1)

            est_days = task_data.get("estimated_days", 3)
            task_deadline_obj = datetime.now() + timedelta(days=est_days)
            task_deadline_str = task_deadline_obj.strftime("%Y-%m-%d")

            new_task = models.Task(
                task_id=str(uuid.uuid4()),
                title=task_data.get("title", "Unnamed Task"),
                required_skills=task_skills,
                project_id=new_project_id,
                assigned_to=emp_id,
                status="Assigned" if emp_id else "Unassigned",
                assignment_reason=ai_explanation,
                estimated_days=est_days,
                deadline_date=task_deadline_str
            )
            db.add(new_task)
            
            current_phase_tasks.append({
                "task_id": new_task.task_id,
                "subtask": new_task.title,
                "skills_needed": new_task.required_skills,
                "assigned_to_name": emp_name,
                "estimated_days": est_days,
                "deadline_date": task_deadline_str,
                "assignment_reason": ai_explanation 
            })
            
        project_hierarchy.append({
            "phase_name": phase_title,
            "tasks": current_phase_tasks
        })
        
    new_project = models.Project(
        project_id=new_project_id, 
        name=request.name, 
        description=request.description,
        manager_id=current_user.user_id
    )
    db.add(new_project)
            
    db.commit()
    return {
        "status": "success", 
        "project_id": new_project_id,
        "project_name": request.name, 
        "project_roadmap": project_hierarchy 
    }

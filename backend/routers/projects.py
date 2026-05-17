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

router = APIRouter()

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@router.post("/generate-project")
def create_and_assign_project(request: ProjectRequest, db: Session = Depends(get_db)):
    new_project_id = str(uuid.uuid4())
    new_project = models.Project(
        project_id=new_project_id, 
        name=request.name, 
        description=request.description
    )
    db.add(new_project)
    db.commit()

    ai_phases = break_down_project(request.description)
    global_workload_tracker = {}
    all_active_tasks = db.query(models.Task).filter(models.Task.status != "Completed").all()
    for active_task in all_active_tasks:
        if active_task.assigned_to:
            global_workload_tracker[active_task.assigned_to] = global_workload_tracker.get(active_task.assigned_to, 0) + 1
    
    project_hierarchy = []
    freshers_hired_for_project = 0 
    
    for phase in ai_phases:
        phase_title = phase.get("phase_title") or phase.get("title") or "Unnamed Phase"
        current_phase_tasks = [] 
        
        for task_data in phase.get("subtasks", []):
            task_skills = task_data.get("required_skills", [])
            needs_fresher = freshers_hired_for_project < 2
            
            best_emp, ai_explanation = find_best_employee(db, task_skills, global_workload_tracker, force_fresher=needs_fresher)
            
            if not best_emp and needs_fresher:
                best_emp, ai_explanation = find_best_employee(db, task_skills, global_workload_tracker, force_fresher=False)
                if best_emp:
                    ai_explanation = "[FALLBACK: No fresher had the skills] " + ai_explanation
            
            if best_emp and best_emp.experience <= 2:
                freshers_hired_for_project += 1
            
            emp_id = best_emp.user_id if best_emp else None
            emp_name = best_emp.name if best_emp else "Unassigned (Needs Manual Review)"
            
            if emp_id:
                global_workload_tracker[emp_id] = global_workload_tracker.get(emp_id, 0) + 1

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
            
    db.commit()
    return {
        "status": "success", 
        "project_id": new_project_id,
        "project_name": request.name, 
        "project_roadmap": project_hierarchy 
    }

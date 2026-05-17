from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models
from database import get_db
from schemas import OverdueCheckRequest
from assignment import find_best_employee

router = APIRouter()

@router.put("/tasks/{task_id}/complete")
def complete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.task_id == task_id).first()
    
    if not task:
        return {"status": "error", "message": "Task not found!"}
        
    task.status = "Completed"

    employee = db.query(models.Employee).filter(models.Employee.user_id == task.assigned_to).first()
    if employee:
        current_score = employee.reliability_score or 100
        employee.reliability_score = min(100, current_score + 2)

        history_entry = models.ReliabilityHistory(
            user_id=employee.user_id,
            score=employee.reliability_score,
            recorded_at=datetime.now().strftime("%Y-%m-%d")
        )
        db.add(history_entry)

    db.commit()
    
    return {
        "status": "success", 
        "message": f"Task '{task.title}' marked as Completed!",
        "new_status": task.status
    }

@router.post("/manage-overdue")
def manage_overdue_tasks(request: OverdueCheckRequest, db: Session = Depends(get_db)):
    query = db.query(models.Task).filter(
        models.Task.status != "Completed",
        models.Task.deadline_date < request.simulated_today
    )
    
    if request.project_id:
        query = query.filter(models.Task.project_id == request.project_id)
        
    overdue_tasks = query.all()
    actions_taken = []
    
    for task in overdue_tasks:
        current_emp = db.query(models.Employee).filter(models.Employee.user_id == task.assigned_to).first()
        
        if not current_emp:
            continue
            
        emp_reliability = current_emp.reliability_score or 100
        current_reason = task.assignment_reason or ""
        extension_count = current_reason.count("[EXTENSION]")
        
        if emp_reliability >= 80 and extension_count < 2:
            current_score = current_emp.reliability_score or 100
            current_emp.reliability_score = max(0, current_score - 5)
            
            old_date_obj = datetime.strptime(task.deadline_date, "%Y-%m-%d")
            new_date_obj = old_date_obj + timedelta(days=2)
            task.deadline_date = new_date_obj.strftime("%Y-%m-%d")
            
            task.assignment_reason = current_reason + f" | [EXTENSION] Extended by 2 days. {current_emp.name} is reliable but lost 5 points (New Score: {current_emp.reliability_score}/100)."
            
            actions_taken.append({
                "task": task.title,
                "action": "Extended",
                "employee": current_emp.name,
                "new_deadline": task.deadline_date
            })
            
        else:
            old_emp_name = current_emp.name
            current_score = current_emp.reliability_score or 100
            current_emp.reliability_score = max(0, current_score - 5)
            
            new_emp, new_reason = find_best_employee(db, task.required_skills, active_workload={}, exclude_user_id=current_emp.user_id)
            
            if new_emp:
                task.assigned_to = new_emp.user_id
                
                if extension_count >= 2:
                    reason_msg = f"[REASSIGNED from {old_emp_name} because max extensions (2) were reached]"
                else:
                    reason_msg = f"[REASSIGNED from {old_emp_name} due to low reliability ({emp_reliability}/100)]"
                    
                task.assignment_reason = f"{reason_msg}. NEW: {new_reason}"
                
                new_date_obj = datetime.strptime(request.simulated_today, "%Y-%m-%d") + timedelta(days=3)
                task.deadline_date = new_date_obj.strftime("%Y-%m-%d")
                
                actions_taken.append({
                    "task": task.title,
                    "action": "Reassigned",
                    "old_employee": old_emp_name,
                    "new_employee": new_emp.name,
                    "new_deadline": task.deadline_date
                })

        history_entry = models.ReliabilityHistory(
            user_id=current_emp.user_id,
            score=current_emp.reliability_score or 100,
            recorded_at=request.simulated_today
        )
        db.add(history_entry)
    
    db.commit()
    
    return {
        "status": "success",
        "message": f"Scanned for tasks older than {request.simulated_today}",
        "tasks_processed": len(overdue_tasks),
        "actions": actions_taken
    }

@router.get("/employee/{user_id}/tasks")
def get_employee_tasks(user_id: str, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).filter(models.Task.assigned_to == user_id).all()
    
    task_list = []
    for t in tasks:
        project = db.query(models.Project).filter(models.Project.project_id == t.project_id).first()
        task_list.append({
            "task_id": t.task_id,
            "title": t.title,
            "status": t.status,
            "deadline_date": t.deadline_date,
            "estimated_days": t.estimated_days,
            "required_skills": t.required_skills,
            "project_name": project.name if project else "Unknown",
            "assignment_reason": t.assignment_reason
        })
    
    return {
        "status": "success",
        "total_tasks": len(task_list),
        "tasks": task_list
    }

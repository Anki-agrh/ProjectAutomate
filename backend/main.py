from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel #taking user input and validating it
import uuid
import models
from database import engine, SessionLocal
from ai_planner import break_down_project  #from aiplanner file taking project description
from assignment import find_best_employee # from assignment file to find best employee for task
from datetime import datetime, timedelta

from fastapi.middleware.cors import CORSMiddleware
import analytics

# This ensures tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="APEX Backend API")

# 🚨 NEW: Add CORS so React can talk to us!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)

# Dependency: This opens and safely closes the database connection per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# This defines the shape of the data the user will send
class ProjectRequest(BaseModel):
    name: str
    description: str
    target_deadline: str  # NEW: e.g., "2026-12-31"

# NEW: The shape of the data for the Time Machine route
class OverdueCheckRequest(BaseModel):
    simulated_today: str  # e.g., "2026-12-01"
    project_id: str = None

@app.get("/")
def read_root():
    return {"message": "APEX Backend is running successfully!"}

# ROUTE: Fetch Projects
@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

# ROUTE: Fetch Employees
@app.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

# NEW ROUTE: The Dynamic AI Planner

@app.post("/generate-project")
def create_and_assign_project(request: ProjectRequest, db: Session = Depends(get_db)):
    
    # 1. Create and save the new Project to PostgreSQL
    new_project_id = str(uuid.uuid4())
    new_project = models.Project(
        project_id=new_project_id, 
        name=request.name, 
        description=request.description
    )
    db.add(new_project)
    db.commit()

    # 2. Get the nested tasks from Gemini
    ai_phases = break_down_project(request.description)

    project_workload_tracker = {}
    project_hierarchy = []
    
    # ==========================================
    # 🚨 NEW: Track freshers in this project
    # ==========================================
    freshers_hired_for_project = 0 
    
    # 3. Loop through the AI output, match employees, and save tasks
    for phase in ai_phases:
        phase_title = phase.get("phase_title") or phase.get("title") or "Unnamed Phase"
        current_phase_tasks = [] # Hold tasks just for this phase
        
        for task_data in phase.get("subtasks", []):
            task_skills = task_data.get("required_skills", [])
            
            # ==========================================
            # 🚨 NEW: FRESHER HIRING LOGIC 🚨
            # ==========================================
            needs_fresher = freshers_hired_for_project < 2
            
            # Try to assign to a fresher first
            best_emp, ai_explanation = find_best_employee(db, task_skills, project_workload_tracker, force_fresher=needs_fresher)
            
            # FALLBACK: What if the task is too hard and no fresher has the skills?
            if not best_emp and needs_fresher:
                best_emp, ai_explanation = find_best_employee(db, task_skills, project_workload_tracker, force_fresher=False)
                if best_emp:
                    ai_explanation = "[FALLBACK: No fresher had the skills] " + ai_explanation
            
            # If we successfully assigned someone, check if they are a fresher
            if best_emp and best_emp.experience <= 2:
                freshers_hired_for_project += 1
            # ==========================================
            
            emp_id = best_emp.user_id if best_emp else None
            emp_name = best_emp.name if best_emp else "Unassigned (Needs Manual Review)"
            
            if emp_id:
                project_workload_tracker[emp_id] = project_workload_tracker.get(emp_id, 0) + 1

            # ==========================================
            # 🚨 NEW: DEADLINE LOGIC HERE! 🚨
            # ==========================================
            # Grab the AI's time estimate (default to 3 days if AI forgets)
            est_days = task_data.get("estimated_days", 3)
            
            # Calculate the exact calendar date (Today + estimated days)
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
                
                # --- NEW: Save the deadline data! ---
                estimated_days=est_days,
                deadline_date=task_deadline_str
            )
            db.add(new_task)
            
            # Add to THIS phase's list, not a global list
            current_phase_tasks.append({
                "task_id": new_task.task_id,
                "subtask": new_task.title,
                "skills_needed": new_task.required_skills,
                "assigned_to_name": emp_name,
                "estimated_days": est_days,         # <--- Output to React/Swagger
                "deadline_date": task_deadline_str, # <--- Output to React/Swagger
                "assignment_reason": ai_explanation 
            })
            
        # Add the completed phase (with its nested tasks) to the main hierarchy
        project_hierarchy.append({
            "phase_name": phase_title,
            "tasks": current_phase_tasks
        })
            
    db.commit()
    
    # Return the nested hierarchy!
    return {
        "status": "success", 
        "project_id": new_project_id,
        "project_name": request.name, 
        "project_roadmap": project_hierarchy 
    }

# ==========================================
# 🚨 BRAND NEW ROUTES FOR TASK MANAGEMENT 🚨
# ==========================================

# ROUTE: Complete a specific task
@app.put("/tasks/{task_id}/complete")
def complete_task(task_id: str, db: Session = Depends(get_db)):
    
    # 1. Find the specific task in the database
    task = db.query(models.Task).filter(models.Task.task_id == task_id).first()
    
    # 2. Safety check
    if not task:
        return {"status": "error", "message": "Task not found!"}
        
    # 3. Update the status
    task.status = "Completed"

    #NEW KARMA LOGIC: Reward the Employee!
    employee = db.query(models.Employee).filter(models.Employee.user_id == task.assigned_to).first()
    if employee:
        # If they don't have a score yet, assume 100
        current_score = employee.reliability_score or 100
        # Add 2 points, but don't let it go over 100
        employee.reliability_score = min(100, current_score + 2)

        # 🚨 NEW: Log this score update!
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

# ROUTE: The "Time Machine" (Midnight Overdue Sweep)
@app.post("/manage-overdue")
def manage_overdue_tasks(request: OverdueCheckRequest, db: Session = Depends(get_db)):
    
    # 1. Start the query for overdue, uncompleted tasks
    query = db.query(models.Task).filter(
        models.Task.status != "Completed",
        models.Task.deadline_date < request.simulated_today
    )
    
    #  NEW: Agar user ne project_id diya hai, toh sirf us project ko filter karo!
    if request.project_id:
        query = query.filter(models.Task.project_id == request.project_id)
        
    overdue_tasks = query.all()
    
    actions_taken = []
    
    # 2. Apply your Reliability Logic!
    for task in overdue_tasks:
        current_emp = db.query(models.Employee).filter(models.Employee.user_id == task.assigned_to).first()
        
        if not current_emp:
            continue
            
        emp_reliability = current_emp.reliability_score or 100
        
        # LOGIC A: Good Reliability (80 or higher) -> Extend Deadline by 2 days
        if emp_reliability >= 80:
            old_date_obj = datetime.strptime(task.deadline_date, "%Y-%m-%d")
            new_date_obj = old_date_obj + timedelta(days=2)
            task.deadline_date = new_date_obj.strftime("%Y-%m-%d")
            
            current_reason = task.assignment_reason or ""
            task.assignment_reason = current_reason + f" | [EXTENSION] Extended by 2 days. {current_emp.name} is highly reliable ({emp_reliability}/100)."
            
            actions_taken.append({
                "task": task.title,
                "action": "Extended",
                "employee": current_emp.name,
                "new_deadline": task.deadline_date
            })
            
        # LOGIC B: Bad Reliability (Under 80) -> Reassign Task!
        else:
            old_emp_name = current_emp.name

            # ==========================================
            # 🚨 NEW KARMA LOGIC: Punish the slacker! 🚨
            # ==========================================
            current_score = current_emp.reliability_score or 100
            # Deduct 5 points, but don't let it go below 0
            current_emp.reliability_score = max(0, current_score - 5)
            
            # Find a new employee, passing the old employee's ID to exclude them
            new_emp, new_reason = find_best_employee(db, task.required_skills, active_workload={}, exclude_user_id=current_emp.user_id)
            
            if new_emp:
                task.assigned_to = new_emp.user_id
                task.assignment_reason = f"[REASSIGNED from {old_emp_name} due to low reliability ({emp_reliability}/100)]. NEW: {new_reason}"
                
                # Give the new person a fresh 3 days from "today"
                new_date_obj = datetime.strptime(request.simulated_today, "%Y-%m-%d") + timedelta(days=3)
                task.deadline_date = new_date_obj.strftime("%Y-%m-%d")
                
                actions_taken.append({
                    "task": task.title,
                    "action": "Reassigned",
                    "old_employee": old_emp_name,
                    "new_employee": new_emp.name,
                    "new_deadline": task.deadline_date
                })

        # 🚨 NEW: Log the employee score after the sweep
        # This handles the case where reliability was Deducted or simply unchanged
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

# ==========================================
# 🚨 BRAND NEW ROUTE: MANAGER DASHBOARD 🚨
# ==========================================
@app.get("/manager/dashboard")
def get_manager_dashboard(db: Session = Depends(get_db)):
    
    # 1. SYSTEM OVERVIEW: Count total projects and active tasks
    total_projects = db.query(models.Project).count()
    
    # Active tasks are anything NOT marked "Completed"
    active_tasks_query = db.query(models.Task).filter(models.Task.status != "Completed")
    total_active_tasks = active_tasks_query.count()
    
    # 2. ALERTS: Tasks Due Soon (within the next 3 days)
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
        "assigned_to": t.assigned_to # Can be helpful for the frontend to know who to bug!
    } for t in tasks_due_soon]
    
    # 3. WALL OF SHAME: Find tasks that were recently reassigned
    # We look for the exact tag "[REASSIGNED" in the assignment reason
    reassigned_tasks = db.query(models.Task).filter(
        models.Task.assignment_reason.like("%[REASSIGNED%")
    ).all()
    
    reassignment_list = [{
        "task": t.title,
        "reason": t.assignment_reason
    } for t in reassigned_tasks]
    
    # ==========================================
    # 🚨 THE BENCH REPORT & SKILL GAP ANALYSIS 🚨
    # ==========================================
    # Get a list of IDs of everyone who currently HAS an active task
    busy_employee_ids = [task.assigned_to for task in active_tasks_query.all() if task.assigned_to]
    
    # Find all employees who are NOT in that busy list
    idle_employees = db.query(models.Employee).all()
    bench_list = []
    available_skills = {} # <-- NEW: Track what skills are idle
    
    for emp in idle_employees:
        if emp.user_id not in busy_employee_ids:
            bench_list.append({
                "name": emp.name,
                "reliability_score": emp.reliability_score or 100,
                "skills": emp.skills
            })
            
            # Add their skills to the availability counter
            if emp.skills:
                for skill in emp.skills:
                    available_skills[skill] = available_skills.get(skill, 0) + 1
    
    # 4. Return the beautiful JSON report
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
        "available_bench_skills": available_skills, # <-- NEW: Tells manager what skills they can use right now!
        "recent_activity": {
            "reassignments_count": len(reassignment_list),
            "reassignments": reassignment_list
        }
    }
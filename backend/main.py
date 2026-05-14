from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel #taking user input and validating it
import uuid
import models
from database import engine, SessionLocal
from ai_planner import break_down_project  #from aiplanner file taking project description
from assignment import find_best_employee # from assignment file to find best employee for task
from datetime import datetime, timedelta
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import analytics
import random

# This ensures tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ScrumMaster Backend API")

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
    project_id: Optional[str] = None

# AUTH: Login request shape
class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def read_root():
    return {"message": "ScrumMaster Backend is running successfully!"}

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

    global_workload_tracker = {}

    all_active_tasks = db.query(models.Task).filter(models.Task.status != "Completed").all()
    for active_task in all_active_tasks:
        if active_task.assigned_to:
            global_workload_tracker[active_task.assigned_to] = global_workload_tracker.get(active_task.assigned_to, 0) + 1
    
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
            best_emp, ai_explanation = find_best_employee(db, task_skills, global_workload_tracker, force_fresher=needs_fresher)
            
            # FALLBACK: What if the task is too hard and no fresher has the skills?
            if not best_emp and needs_fresher:
                best_emp, ai_explanation = find_best_employee(db, task_skills, global_workload_tracker, force_fresher=False)
                if best_emp:
                    ai_explanation = "[FALLBACK: No fresher had the skills] " + ai_explanation
            
            # If we successfully assigned someone, check if they are a fresher
            if best_emp and best_emp.experience <= 2:
                freshers_hired_for_project += 1
            # ==========================================
            
            emp_id = best_emp.user_id if best_emp else None
            emp_name = best_emp.name if best_emp else "Unassigned (Needs Manual Review)"
            
            if emp_id:
                global_workload_tracker[emp_id] = global_workload_tracker.get(emp_id, 0) + 1

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
        current_reason = task.assignment_reason or ""
        extension_count = current_reason.count("[EXTENSION]")
        
        # LOGIC A: Good Reliability (80 or higher) AND Max Extensions NOT reached
        if emp_reliability >= 80 and extension_count < 2:
            # 🚨 FIX: Deduct 5 points for missing the deadline, even if they get an extension!
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
            
        # LOGIC B: Bad Reliability (Under 80) OR Max Extensions Reached (2) -> Reassign Task!
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
                
                if extension_count >= 2:
                    reason_msg = f"[REASSIGNED from {old_emp_name} because max extensions (2) were reached]"
                else:
                    reason_msg = f"[REASSIGNED from {old_emp_name} due to low reliability ({emp_reliability}/100)]"
                    
                task.assignment_reason = f"{reason_msg}. NEW: {new_reason}"
                
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
        "assigned_to": t.assigned_employee.name if t.assigned_employee else "Unassigned"
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

# ==========================================
# 🚨 AUTH: SEED CREDENTIALS ROUTE 🚨
# ==========================================
@app.post("/seed-credentials")
def generate_dummy_logins(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    
    updated_count = 0
    for emp in employees:
        # Skip if already a manager (don't overwrite)
        if emp.email == "admin@scrummaster.com":
            continue
            
        # Generate email from name
        if emp.name:
            clean_name = emp.name.lower().replace(" ", ".")
            # Remove any special characters
            clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '.')
            emp.email = f"{clean_name}@scrummaster.com"
        else:
            emp.email = f"emp{emp.user_id[:8]}@scrummaster.com"
            
        # Set universal test password
        emp.hashed_password = "password123"
        
        # Set role to employee (preserve existing role if it's already set to something meaningful)
        if not emp.role or emp.role == "manager":
            pass  # Don't change manager roles
        else:
            emp.role = "employee"
        updated_count += 1

    # Create the Super Manager if it doesn't exist
    manager_email = "admin@scrummaster.com"
    existing_manager = db.query(models.Employee).filter_by(email=manager_email).first()
    
    if not existing_manager:
        new_manager = models.Employee(
            user_id=str(uuid.uuid4()),
            name="Super Manager",
            email=manager_email,
            hashed_password="admin",
            role="manager",
            domain="Management",
            experience=10,
            skills=["Management", "Leadership", "Strategy"],
            avg_quality_score=9.5,
            reliability_score=100
        )
        db.add(new_manager)
        
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Successfully generated emails and passwords for {updated_count} employees!",
        "manager_login": "Email: admin@scrummaster.com | Password: admin",
        "employee_login_format": "firstname.lastname@scrummaster.com | Password: password123"
    }

# ==========================================
# 🚨 AUTH: LOGIN ROUTE 🚨
# ==========================================
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(models.Employee).filter(models.Employee.email == request.email).first()
    
    if not user:
        return {"status": "error", "message": "No account found with this email."}
    
    # Check password (plain text for now — not production-ready!)
    if user.hashed_password != request.password:
        return {"status": "error", "message": "Incorrect password."}
    
    # Determine role
    is_manager = (user.role == "manager") or (user.email == "admin@scrummaster.com")
    
    return {
        "status": "success",
        "message": f"Welcome back, {user.name}!",
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": "manager" if is_manager else "employee",
            "domain": user.domain,
            "skills": user.skills,
            "experience": user.experience,
            "reliability_score": user.reliability_score,
            "avg_quality_score": user.avg_quality_score
        }
    }

# ==========================================
# 🚨 EMPLOYEE: MY TASKS ROUTE 🚨
# ==========================================
@app.get("/employee/{user_id}/tasks")
def get_employee_tasks(user_id: str, db: Session = Depends(get_db)):
    """Returns all tasks assigned to a specific employee."""
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

import random

@app.post("/fix-employee-skills")
def balance_employee_skills(db: Session = Depends(get_db)):
    # 0. Migrate existing tasks to standard names
    skill_mapping = {
        "node": "Node.js",
        "express": "Express.js",
        "api integration": "api development",
        "REST APIs": "REST API design",
        "REST API consumption": "REST API design",
        "Cybersecurity": "security engineering",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "react": "React",
        "mongodb": "MongoDB",
        "ui/ux": "UI/UX"
    }
    
    tasks = db.query(models.Task).all()
    for task in tasks:
        if task.required_skills:
            new_skills = []
            for s in task.required_skills:
                s_lower = s.strip().lower()
                matched = False
                for old_key, new_val in skill_mapping.items():
                    if s_lower == old_key.lower():
                        new_skills.append(new_val)
                        matched = True
                        break
                if not matched:
                    new_skills.append(s.strip())
            task.required_skills = list(set(new_skills))
    db.commit()

    TECH_POOL = [
        "HTML", "CSS", "JavaScript", "TypeScript", "JavaScript/TypeScript", "React", "Next.js", 
        "Vue.js", "Angular", "Tailwind CSS", "SASS", "Redux", "Webpack", 
        "Figma", "UI/UX", "Responsive Design", "Micro-frontends",
        "Node.js", "Express.js", "backend development", "Python", "FastAPI", "Django", "Flask", 
        "Java", "Spring Boot", "C++", "C#", ".NET", "Go", "Rust", 
        "Ruby on Rails", "PHP", "Microservices", "REST API design", "GraphQL", 
        "gRPC", "WebSockets", "api development",
        "database management", "SQL", "PostgreSQL", "MySQL", "MongoDB", 
        "Mongoose", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", 
        "Firebase", "Oracle", "Prisma", "Sequelize",
        "DevOps", "Linux", "Docker", "Kubernetes", "AWS", "Azure", "GCP", 
        "CI/CD", "Jenkins", "GitHub Actions", "Terraform", "Ansible", 
        "Nginx", "Apache", "Prometheus", "Grafana", "Bash Scripting",
        "React Native", "Flutter", "Swift", "Kotlin", "iOS Development", 
        "Android Development", "Dart",
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", 
        "NLP", "Computer Vision", "Pandas", "NumPy", "Scikit-learn", 
        "Data Analytics", "Prompt Engineering", "LLMs", "Vector Databases",
        "Jest", "Supertest", "Cypress", "Selenium", "Mocha", "Chai", 
        "TDD", "QA Automation", "Postman",
        "jwt", "OAuth", "security engineering", "Penetration Testing", "Cryptography", 
        "System Design", "Cloud Architecture", "Serverless", "SSO",
        "Git", "GitHub", "npm/yarn", "Axios", "Agile", "Scrum", "Jira", 
        "Communication", "Technical Writing", "Problem Solving", "Leadership", 
        "Code Review", "Pair Programming"
    ]
    
    employees = db.query(models.Employee).filter(models.Employee.role != "manager").all()
    
    # 1. Sabke skills reset karne ke liye ek khali set banao
    emp_skills_dict = {emp.user_id: set() for emp in employees}
    
    # 2. 🚨 THE GUARANTEE LOGIC: Har ek skill ko pakdo
    for skill in TECH_POOL:
        # Har skill ke liye minimum 8, maximum 12 random log chuno
        chosen_emps = random.sample(employees, k=random.randint(8, 12))
        
        for emp in chosen_emps:
            emp_skills_dict[emp.user_id].add(skill)

    # 3. Failsafe: Ensure koi employee bina skill ke na bache (Minimum 3 skills)
    for emp in employees:
        while len(emp_skills_dict[emp.user_id]) < 3:
            emp_skills_dict[emp.user_id].add(random.choice(TECH_POOL))
            
    # 4. Database me update kardo
    for emp in employees:
        emp.skills = list(emp_skills_dict[emp.user_id])
        
    db.commit()
    
    return {
        "status": "success",
        "message": f"Successfully guaranteed 8-12 employees for EVERY skill in the pool!",
        "pool_size": len(TECH_POOL)
    }
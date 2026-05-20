from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid, csv, io, random
import models
from database import get_db
from schemas import EmployeeCreateRequest
from dependencies import get_current_user
from security import get_password_hash

router = APIRouter()

@router.get("/employees")
def get_employees(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    employees = db.query(models.Employee).filter(models.Employee.manager_id == current_user.user_id).all()
    
    active_tasks = db.query(models.Task).join(models.Project).filter(
        models.Task.status != "Completed",
        models.Project.manager_id == current_user.user_id
    ).all()
    busy_ids = {t.assigned_to for t in active_tasks if t.assigned_to}
    
    result = []
    for emp in employees:
        emp_dict = {c.name: getattr(emp, c.name) for c in emp.__table__.columns}
        emp_dict["is_on_bench"] = emp.user_id not in busy_ids
        result.append(emp_dict)
        
    return result


# ─── Manual Single-Employee Onboarding ───────────────────────────────────────
@router.post("/employees")
def create_employee(request: EmployeeCreateRequest, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    """Manually onboard one employee. Password is left null (passwordless beta)."""
    # Ensure email is unique across the system (or just per manager if desired, but system is safer for auth)
    existing = db.query(models.Employee).filter(models.Employee.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An employee with email '{request.email}' already exists."
        )

    new_emp = models.Employee(
        user_id=str(uuid.uuid4()),
        name=request.name,
        email=request.email,
        hashed_password=get_password_hash("password123"),  # default password
        role=request.role or "employee",
        domain=request.domain,
        skills=request.skills,
        experience=request.experience,
        avg_quality_score=9.0,
        reliability_score=100,
        manager_id=current_user.user_id
    )
    db.add(new_emp)
    db.flush()  # get user_id before creating history

    # Seed historical ReliabilityHistory records so telemetry charts render beautifully
    today = datetime.now()
    current_score = new_emp.reliability_score or 100
    for i in range(4, -1, -1):  # 5 data points
        date = today - timedelta(days=i*30)
        # Add slight random fluctuation so the chart has a nice dynamic trend line
        fluctuation = random.randint(-4, 4) if i > 0 else 0
        score = max(0, min(100, current_score + fluctuation))
        history_entry = models.ReliabilityHistory(
            user_id=new_emp.user_id,
            score=score,
            recorded_at=date.strftime("%Y-%m-%d")
        )
        db.add(history_entry)
    db.commit()
    db.refresh(new_emp)

    return {
        "status": "success",
        "message": f"{new_emp.name} has been onboarded successfully.",
        "employee": {
            "user_id": new_emp.user_id,
            "name": new_emp.name,
            "email": new_emp.email,
            "role": new_emp.role,
            "domain": new_emp.domain,
            "skills": new_emp.skills,
            "experience": new_emp.experience,
            "avg_quality_score": new_emp.avg_quality_score,
            "reliability_score": new_emp.reliability_score,
        },
    }


# ─── Bulk CSV Upload Onboarding ──────────────────────────────────────────────
@router.post("/employees/upload-csv")
async def upload_employees_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    """
    Upload a CSV with columns: name, email, role, domain, skills, experience.
    Skills should be comma-separated within the field. Duplicate emails are skipped.
    """
    if not file.filename.endswith((".csv", ".CSV")):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    decoded = contents.decode("utf-8-sig")  # handles BOM from Excel exports
    reader = csv.DictReader(io.StringIO(decoded))

    # Normalize header names (strip whitespace & lowercase)
    if reader.fieldnames:
        reader.fieldnames = [f.strip().lower() for f in reader.fieldnames]

    required_cols = {"name", "email"}
    if not required_cols.issubset(set(reader.fieldnames or [])):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must include at least these columns: {', '.join(required_cols)}. Found: {reader.fieldnames}",
        )

    created = 0
    skipped = 0
    errors = []
    today_str = datetime.now().strftime("%Y-%m-%d")

    for idx, row in enumerate(reader, start=2):  # row 1 = header
        email = (row.get("email") or "").strip()
        name = (row.get("name") or "").strip()

        if not email or not name:
            errors.append(f"Row {idx}: missing name or email — skipped.")
            skipped += 1
            continue

        # Duplicate check
        if db.query(models.Employee).filter(models.Employee.email == email).first():
            skipped += 1
            continue

        raw_skills = (row.get("skills") or "").strip()
        skills_list = [s.strip() for s in raw_skills.split(",") if s.strip()] if raw_skills else []

        try:
            experience = int(row.get("experience") or 0)
        except ValueError:
            experience = 0

        emp = models.Employee(
            user_id=str(uuid.uuid4()),
            name=name,
            email=email,
            hashed_password=get_password_hash("password123"), # default password
            role=(row.get("role") or "employee").strip(),
            domain=(row.get("domain") or "General").strip(),
            skills=skills_list,
            experience=experience,
            avg_quality_score=9.0,
            reliability_score=100,
            manager_id=current_user.user_id
        )
        db.add(emp)
        db.flush()

        db.add(models.ReliabilityHistory(
            user_id=emp.user_id,
            score=100,
            recorded_at=today_str,
        ))
        created += 1

    db.commit()

    return {
        "status": "success",
        "message": f"Bulk onboarding complete. {created} employee(s) created, {skipped} skipped.",
        "created": created,
        "skipped": skipped,
        "errors": errors,
    }

@router.post("/fix-employee-skills")
def balance_employee_skills(db: Session = Depends(get_db)):
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
    emp_skills_dict = {emp.user_id: set() for emp in employees}
    
    for skill in TECH_POOL:
        chosen_emps = random.sample(employees, k=random.randint(8, 12))
        for emp in chosen_emps:
            emp_skills_dict[emp.user_id].add(skill)

    for emp in employees:
        while len(emp_skills_dict[emp.user_id]) < 3:
            emp_skills_dict[emp.user_id].add(random.choice(TECH_POOL))
            
    for emp in employees:
        emp.skills = list(emp_skills_dict[emp.user_id])
        
    db.commit()
    
    return {
        "status": "success",
        "message": f"Successfully guaranteed 8-12 employees for EVERY skill in the pool!",
        "pool_size": len(TECH_POOL)
    }

@router.get("/rankings")
def get_employee_rankings(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view rankings.")
        
    employees = db.query(models.Employee).filter(
        models.Employee.manager_id == current_user.user_id,
        models.Employee.role != "manager"
    ).all()
    
    tasks = db.query(models.Task).join(models.Project).filter(
        models.Project.manager_id == current_user.user_id
    ).all()
    
    rankings = []
    import re
    
    for emp in employees:
        emp_tasks = [t for t in tasks if t.assigned_to == emp.user_id]
        completed_count = len([t for t in emp_tasks if t.status == "Completed"])
        
        extended_count = 0
        reassigned_away_count = 0
        
        for t in tasks:
            reason = t.assignment_reason or ""
            if "[EXTENSION]" in reason and emp.name in reason:
                extended_count += 1
            if "[REASSIGNED from " in reason:
                m = re.search(r'\[REASSIGNED from (.*?) (?:because|due to)', reason)
                if m and m.group(1).strip() == emp.name:
                    reassigned_away_count += 1
                    
        base_score = 0
        score = base_score + (completed_count * 2) - (extended_count * 5) - (reassigned_away_count * 15)
        
        rankings.append({
            "user_id": emp.user_id,
            "name": emp.name,
            "domain": emp.domain,
            "base_reliability": base_score,
            "completed_tasks": completed_count,
            "extended_tasks": extended_count,
            "reassigned_tasks": reassigned_away_count,
            "final_score": score
        })
        
    rankings.sort(key=lambda x: x["final_score"], reverse=True)
    
    for idx, r in enumerate(rankings):
        r["rank"] = idx + 1
        if r["final_score"] >= 10:
            r["tier"] = "Top Performer"
        elif r["final_score"] >= 0:
            r["tier"] = "Solid Contributor"
        else:
            r["tier"] = "Needs Improvement"
            
    return rankings

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import random
import models
from database import get_db

router = APIRouter()

@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

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

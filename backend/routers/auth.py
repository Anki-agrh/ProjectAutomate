from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import models
from database import get_db
from schemas import LoginRequest
from security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/seed-credentials")
def generate_dummy_logins(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    
    updated_count = 0
    hashed_default_pwd = get_password_hash("password123")
    
    for emp in employees:
        if emp.email == "admin@scrummaster.com":
            continue
            
        if emp.name:
            clean_name = emp.name.lower().replace(" ", ".")
            clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '.')
            emp.email = f"{clean_name}@scrummaster.com"
        else:
            emp.email = f"emp{emp.user_id[:8]}@scrummaster.com"
            
        emp.hashed_password = hashed_default_pwd
        
        if not emp.role or emp.role == "manager":
            pass
        else:
            emp.role = "employee"
        updated_count += 1

    manager_email = "admin@scrummaster.com"
    existing_manager = db.query(models.Employee).filter_by(email=manager_email).first()
    
    if not existing_manager:
        hashed_admin_pwd = get_password_hash("admin")
        new_manager = models.Employee(
            user_id=str(uuid.uuid4()),
            name="Super Manager",
            email=manager_email,
            hashed_password=hashed_admin_pwd,
            role="manager",
            domain="Management",
            experience=10,
            skills=["Management", "Leadership", "Strategy"],
            avg_quality_score=9.5,
            reliability_score=100
        )
        db.add(new_manager)
    else:
        existing_manager.hashed_password = get_password_hash("admin")
        
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Successfully generated emails and securely hashed passwords for {updated_count} employees!",
        "manager_login": "Email: admin@scrummaster.com | Password: admin",
        "employee_login_format": "firstname.lastname@scrummaster.com | Password: password123"
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Employee).filter(models.Employee.email == request.email).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No account found with this email.")
    
    # Verify using passlib
    if not verify_password(request.password, user.hashed_password):
        # Fallback for old plain-text passwords during transition
        if user.hashed_password == request.password:
            user.hashed_password = get_password_hash(request.password)
            db.commit()
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")
    
    is_manager = (user.role == "manager") or (user.email == "admin@scrummaster.com")
    
    # Generate JWT
    access_token = create_access_token(data={"sub": user.email, "role": "manager" if is_manager else "employee"})
    
    return {
        "status": "success",
        "message": f"Welcome back, {user.name}!",
        "access_token": access_token,
        "token_type": "bearer",
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

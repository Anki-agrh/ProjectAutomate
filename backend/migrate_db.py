import os
from sqlalchemy import text
from database import engine, SessionLocal
import models

def run_migration():
    print("Starting database migration for Multi-Tenancy...")
    
    with engine.connect() as conn:
        # Add manager_id to employees
        try:
            conn.execute(text("ALTER TABLE employees ADD COLUMN manager_id VARCHAR;"))
            print("Added manager_id column to employees table.")
        except Exception as e:
            if 'already exists' in str(e).lower() or 'duplicate column' in str(e).lower():
                print("manager_id column already exists in employees table.")
            else:
                print(f"Error adding manager_id to employees: {e}")
                
        # Add manager_id to projects
        try:
            conn.execute(text("ALTER TABLE projects ADD COLUMN manager_id VARCHAR;"))
            print("Added manager_id column to projects table.")
        except Exception as e:
            if 'already exists' in str(e).lower() or 'duplicate column' in str(e).lower():
                print("manager_id column already exists in projects table.")
            else:
                print(f"Error adding manager_id to projects: {e}")
                
        conn.commit()

    db = SessionLocal()
    
    # Find the default admin
    admin = db.query(models.Employee).filter(models.Employee.email == "admin@scrummaster.com").first()
    
    if admin:
        admin_id = admin.user_id
        print(f"Found admin account with ID: {admin_id}")
        
        # Assign all existing employees to the admin (except managers)
        employees = db.query(models.Employee).filter(models.Employee.role != "manager").all()
        for emp in employees:
            if not emp.manager_id:
                emp.manager_id = admin_id
                
        # Make sure managers have manager_id = themselves or null
        managers = db.query(models.Employee).filter(models.Employee.role == "manager").all()
        for mgr in managers:
            mgr.manager_id = mgr.user_id
                
        # Assign all existing projects to the admin
        projects = db.query(models.Project).all()
        for proj in projects:
            if not proj.manager_id:
                proj.manager_id = admin_id
                
        db.commit()
        print(f"Assigned {len(employees)} employees and {len(projects)} projects to the admin manager.")
    else:
        print("No admin@scrummaster.com found. Run auth /seed-credentials or signup first.")
        
    db.close()
    print("Migration complete!")

if __name__ == "__main__":
    run_migration()

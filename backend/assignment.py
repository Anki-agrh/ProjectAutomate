from sqlalchemy.orm import Session
from models import Employee
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import joblib

print("Loading Vector Embeddings Model...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

try:
    ml_model = joblib.load('matchmaker_model.pkl')
    print("[OK] ML Matchmaker Brain loaded successfully!")
except Exception as e:
    print("[ERROR] ML Model not found! Did you run train_model.py?")
    ml_model = None

EMPLOYEE_VECTOR_CACHE = {}

# 🚨 NEW: Added 'force_fresher' flag at the end
from sqlalchemy.orm import Session
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import models

# (Assuming embedding_model, ml_model, and EMPLOYEE_VECTOR_CACHE are defined at the top of your file)

def find_best_employee(db: Session, required_skills: list, active_workload: dict = None, exclude_user_id: str = None, force_fresher: bool = False, manager_id: str = None, bench_size: int = 0, current_project_id: str = None):
    
    if active_workload is None:
        active_workload = {}
    
    # 1. FIXED: Return two items if no skills required
    if not required_skills:
        return None, "No specific skills required by AI. Needs manual review."

    task_text = " ".join(required_skills)
    task_vector = embedding_model.encode([task_text])
    
    # 🚨 FIX: Exclude managers from being assigned basic tasks
    query = db.query(models.Employee).filter(models.Employee.role != "manager")

    if manager_id:
        query = query.filter(models.Employee.manager_id == manager_id)


    # ==========================================
    # 🚨 THE FRESHER FILTER 🚨
    # ==========================================
    if force_fresher:
        query = query.filter(models.Employee.experience <= 2)

    all_employees = query.all()

    best_match = None
    # 🚨 FIX: Changed from -1 to -9999 because your workload penalty (1000) can make scores highly negative!
    highest_score = -9999 
    
    winning_stats = {}

    eligible_emps = []
    
    for emp in all_employees:
        # Skip the employee if they were just fired from this task!
        if exclude_user_id and emp.user_id == exclude_user_id:
            continue
            
        if bench_size > 0:
            emp_wl = active_workload.get(emp.user_id, {"tasks": 0, "projects": set()})
            # Constraint 1: Max 2 tasks per person
            if emp_wl["tasks"] >= 2:
                continue
            # Constraint 2: Max 1 active project per person
            if len(emp_wl["projects"]) > 0 and current_project_id not in emp_wl["projects"]:
                continue

        emp_skills = emp.skills or []
        emp_text = " ".join(emp_skills)
        
        if not emp_text:
            similarity_percentage = 0.0
        else:
            # --- START OF CACHE MAGIC ---
            if emp.user_id not in EMPLOYEE_VECTOR_CACHE:
                EMPLOYEE_VECTOR_CACHE[emp.user_id] = embedding_model.encode([emp_text])
                
            emp_vector = EMPLOYEE_VECTOR_CACHE[emp.user_id]
            # --- END OF CACHE MAGIC ---
            
            similarity_percentage = cosine_similarity(task_vector, emp_vector)[0][0]
            similarity_percentage = max(0.0, float(similarity_percentage))

        # 🚨 STRICT CUTOFF: You can increase this to 0.25 if you want stricter matching!
        if similarity_percentage > 0.15:
            eligible_emps.append((emp, similarity_percentage))

    if not eligible_emps:
        return None, "No suitable employee found in database (skills didn't match)."

    # --- BATCH PREDICTION OPTIMIZATION ---
    # This prevents the 30-second timeout by running ML inference once instead of 400 times!
    if ml_model:
        feature_data = []
        for emp, sim in eligible_emps:
            feature_data.append({
                'experience': emp.experience, 
                'reliability_score': emp.reliability_score or 100,
                'avg_quality_score': getattr(emp, 'avg_quality_score', 0),
                'skill_match': sim
            })
        
        feature_df = pd.DataFrame(feature_data)
        batch_scores = ml_model.predict(feature_df)
        
        for i, (emp, sim) in enumerate(eligible_emps):
            base_score = batch_scores[i]
            
            emp_wl = active_workload.get(emp.user_id, {"tasks": 0})
            current_tasks = emp_wl["tasks"]
            workload_penalty = current_tasks * 1000 
            seniority_penalty = 15 if emp.experience > 7 else 0
                
            final_fit_score = base_score - workload_penalty - seniority_penalty
            
            if final_fit_score > highest_score:
                highest_score = final_fit_score
                best_match = emp
                winning_stats = {
                    "skill": round(sim * 100, 1),
                    "exp": emp.experience,
                    "rel": emp.reliability_score or 100
                }
    else:
        for emp, sim in eligible_emps:
            avg_quality = getattr(emp, 'avg_quality_score', 0)
            base_score = ((sim * 60) + emp.experience + avg_quality) * ((emp.reliability_score or 100) / 100.0)
            
            emp_wl = active_workload.get(emp.user_id, {"tasks": 0})
            current_tasks = emp_wl["tasks"]
            workload_penalty = current_tasks * 1000 
            seniority_penalty = 15 if emp.experience > 7 else 0
                
            final_fit_score = base_score - workload_penalty - seniority_penalty
            
            if final_fit_score > highest_score:
                highest_score = final_fit_score
                best_match = emp
                winning_stats = {
                    "skill": round(sim * 100, 1),
                    "exp": emp.experience,
                    "rel": emp.reliability_score or 100
                }
                
    # 2. FIXED: Return BOTH the employee AND the explanation string!
    if best_match:
        explanation = f"AI selected {best_match.name} because they have a {winning_stats['skill']}% semantic skill match, {winning_stats['exp']} years of experience, and a strong {winning_stats['rel']}/100 reliability score."
        return best_match, explanation
        
    # 3. FIXED: Return two items if no one is a good fit
    return None, "No suitable employee found in database (skills didn't match)."
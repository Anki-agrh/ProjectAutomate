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
    print("✅ ML Matchmaker Brain loaded successfully!")
except Exception as e:
    print("❌ ML Model not found! Did you run train_model.py?")
    ml_model = None

EMPLOYEE_VECTOR_CACHE = {}

# 🚨 NEW: Added 'force_fresher' flag at the end
def find_best_employee(db: Session, required_skills: list, active_workload: dict = None, exclude_user_id: str = None, force_fresher: bool = False):

    if active_workload is None:
        active_workload = {}
    
    # 1. FIXED: Return two items if no skills required
    if not required_skills:
        return None, "No specific skills required by AI. Needs manual review."

    task_text = " ".join(required_skills)
    task_vector = embedding_model.encode([task_text])
    
    all_employees = db.query(Employee).all()

    # ==========================================
    # 🚨 NEW: THE FRESHER FILTER 🚨
    # If the project needs freshers, strictly filter the list to <= 2 years experience
    # ==========================================
    if force_fresher:
        all_employees = [emp for emp in all_employees if emp.experience <= 2]

    best_match = None
    highest_score = -1
    
    # Dictionary to hold the winner's stats for our explanation
    winning_stats = {}

    for emp in all_employees:

        #Skip the employee if they were just fired from this task!
        if exclude_user_id and emp.user_id == exclude_user_id:
            continue

        emp_skills = emp.skills or []
        emp_text = " ".join(emp_skills)
        
        if not emp_text:
            similarity_percentage = 0.0
        else:
            # --- START OF CACHE MAGIC ---
            # Check if we already did the math for this employee
            if emp.user_id not in EMPLOYEE_VECTOR_CACHE:
                # If not, do the heavy math ONCE and save it to the dictionary
                EMPLOYEE_VECTOR_CACHE[emp.user_id] = embedding_model.encode([emp_text])
                
            # Instantly grab the pre-calculated vector from memory!
            emp_vector = EMPLOYEE_VECTOR_CACHE[emp.user_id]
            # --- END OF CACHE MAGIC ---
            
            similarity_percentage = cosine_similarity(task_vector, emp_vector)[0][0]
            similarity_percentage = max(0.0, float(similarity_percentage))

        if similarity_percentage > 0.15:
            
            if ml_model:
                # pandas DataFrame to avoid warnings!
                feature_vector = pd.DataFrame([{
                    'experience': emp.experience, 
                    'reliability_score': emp.reliability_score or 100,
                    'avg_quality_score': emp.avg_quality_score, 
                    'skill_match': similarity_percentage
                }])
                base_score = ml_model.predict(feature_vector)[0]
            else:
                base_score = ((similarity_percentage * 60) + emp.experience + emp.avg_quality_score) * ((emp.reliability_score or 100) / 100.0)
            
            current_tasks = active_workload.get(emp.user_id, 0)
            workload_penalty = current_tasks * 1000 
            
            # Seniority penalty (Freshers get an advantage)
            seniority_penalty = 0
            if emp.experience > 7:
                seniority_penalty = 15
                
            # Deduct the massive penalty from the base score
            final_fit_score = base_score - workload_penalty - seniority_penalty
            
            if final_fit_score > highest_score:
                highest_score = final_fit_score
                best_match = emp
                
                # Capture the stats of the current leader
                winning_stats = {
                    "skill": round(similarity_percentage * 100, 1),
                    "exp": emp.experience,
                    "rel": emp.reliability_score or 100
                }
                
    # 2. FIXED: Return BOTH the employee AND the explanation string!
    if best_match:
        explanation = f"AI selected {best_match.name} because they have a {winning_stats['skill']}% semantic skill match, {winning_stats['exp']} years of experience, and a strong {winning_stats['rel']}/100 reliability score."
        return best_match, explanation
        
    # 3. FIXED: Return two items if no one is a good fit
    return None, "No suitable employee found in database (skills didn't match)."
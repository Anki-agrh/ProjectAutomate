from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import joblib
import models

print("[OK] Using lightweight TF-IDF skill matcher (no PyTorch needed).")

try:
    ml_model = joblib.load('matchmaker_model.pkl')
    print("[OK] ML Matchmaker Brain loaded successfully!")
except Exception as e:
    print("[WARNING] ML Model not found! Falling back to formula-based scoring.")
    ml_model = None

EMPLOYEE_VECTOR_CACHE = {}

def _get_skill_similarity(task_skills: list, emp_skills: list) -> float:
    """Compute TF-IDF cosine similarity between task skills and employee skills."""
    if not emp_skills:
        return 0.0

    task_text = " ".join(task_skills)
    emp_text = " ".join(emp_skills)

    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([task_text, emp_text])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return max(0.0, float(sim))
    except Exception:
        return 0.0


def find_best_employee(
    db: Session,
    required_skills: list,
    active_workload: dict = None,
    exclude_user_id: str = None,
    force_fresher: bool = False,
    manager_id: str = None,
    bench_size: int = 0,
    current_project_id: str = None
):
    if active_workload is None:
        active_workload = {}

    if not required_skills:
        return None, "No specific skills required by AI. Needs manual review."

    # Build employee query
    query = db.query(models.Employee).filter(models.Employee.role != "manager")

    if manager_id:
        query = query.filter(models.Employee.manager_id == manager_id)

    if force_fresher:
        query = query.filter(models.Employee.experience <= 2)

    all_employees = query.all()

    eligible_emps = []

    for emp in all_employees:
        if exclude_user_id and emp.user_id == exclude_user_id:
            continue

        if bench_size > 0:
            emp_wl = active_workload.get(emp.user_id, {"tasks": 0, "projects": set()})
            if emp_wl["tasks"] >= 2:
                continue
            if len(emp_wl["projects"]) > 0 and current_project_id not in emp_wl["projects"]:
                continue

        emp_skills = emp.skills or []
        similarity = _get_skill_similarity(required_skills, emp_skills)

        if similarity > 0.15:
            eligible_emps.append((emp, similarity))

    if not eligible_emps:
        return None, "No suitable employee found in database (skills didn't match)."

    highest_score = -9999
    best_match = None
    winning_stats = {}

    if ml_model:
        feature_data = [
            {
                'experience': emp.experience,
                'reliability_score': emp.reliability_score or 100,
                'avg_quality_score': getattr(emp, 'avg_quality_score', 0),
                'skill_match': sim
            }
            for emp, sim in eligible_emps
        ]
        feature_df = pd.DataFrame(feature_data)
        batch_scores = ml_model.predict(feature_df)

        for i, (emp, sim) in enumerate(eligible_emps):
            base_score = batch_scores[i]
            emp_wl = active_workload.get(emp.user_id, {"tasks": 0})
            workload_penalty = emp_wl["tasks"] * 1000
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
            workload_penalty = emp_wl["tasks"] * 1000
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

    if best_match:
        explanation = (
            f"AI selected {best_match.name} because they have a "
            f"{winning_stats['skill']}% semantic skill match, "
            f"{winning_stats['exp']} years of experience, and a strong "
            f"{winning_stats['rel']}/100 reliability score."
        )
        return best_match, explanation

    return None, "No suitable employee found in database (skills didn't match)."
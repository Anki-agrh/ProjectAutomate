from database import SessionLocal
import models
from datetime import datetime, timedelta
import random

def seed_history():
    db = SessionLocal()
    employees = db.query(models.Employee).all()
    
    if not employees:
        print("[ERROR] No employees found. Run seed.py first!")
        return

    print(f"Seeding history for {len(employees)} employees...")
    
    today = datetime.now()
    
    for emp in employees:
        # Generate 6 months of data
        current_score = emp.reliability_score or random.randint(70, 100)
        
        for i in range(6, -1, -1): # From 6 months ago to today
            date = today - timedelta(days=i*30)
            
            # Randomly fluctuate the score a bit for "growth" visualization
            growth = random.randint(-5, 10)
            current_score = max(0, min(100, current_score + growth))
            
            history_entry = models.ReliabilityHistory(
                user_id=emp.user_id,
                score=current_score,
                recorded_at=date.strftime("%Y-%m-%d")
            )
            db.add(history_entry)
            
    db.commit()
    db.close()
    print("[OK] Reliability history seeded!")

if __name__ == "__main__":
    seed_history()

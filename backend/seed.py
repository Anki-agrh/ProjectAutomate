import json
from database import SessionLocal
from models import Employee

def seed_database():
    # 1. Open a connection session to the database
    db = SessionLocal()

    # 2. Check if the table is already full so we don't accidentally insert duplicates
    if db.query(Employee).count() > 0:
        print("⚠️ The database already has employees in it! Skipping insertion.")
        db.close()
        return

    print("Reading JSON file...")
    # Make sure this matches your exact JSON file name (processed_fixed.json or processed.json)
    with open('processed_fixed.json', 'r') as file:
        employees_data = json.load(file)

    print(f"Found {len(employees_data)} employees. Inserting into PostgreSQL...")
    
    # 3. Convert the JSON dictionaries into SQLAlchemy Employee model objects
    db_employees = [Employee(**emp_dict) for emp_dict in employees_data]

    # 4. Bulk save them to the database and commit the transaction
    db.bulk_save_objects(db_employees)
    db.commit()
    db.close()

    print(f"✅ SUCCESS! Inserted {len(employees_data)} employees into the database.")

if __name__ == "__main__":
    seed_database()
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

print("Booting up the APEX AI Training Sequence...")

num_samples = 5000

# Generating random stats MATCHING YOUR EXACT DATABASE SCHEMA
experience = np.random.uniform(0.5, 15.0, num_samples) 
avg_quality_score = np.random.uniform(4.0, 10.0, num_samples) 
reliability_score = np.random.randint(30, 101, num_samples) 
skill_match = np.random.uniform(0.0, 1.0, num_samples) 

# Adjusting the math so the AI learns the pattern based on integers
historical_success_score = (
    (skill_match * 60) + 
    (experience * 1.5) + 
    (avg_quality_score * 2)
) * (reliability_score / 100.0)

historical_success_score = np.clip(historical_success_score, 0, 100)

# The Master Vector strictly using your column names
X = pd.DataFrame({
    'experience': experience,
    'reliability_score': reliability_score, 
    'avg_quality_score': avg_quality_score, 
    'skill_match': skill_match
})
y = historical_success_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training the Random Forest Regressor...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test) * 100
print(f"Training Complete! Model Accuracy: {accuracy:.2f}%")

joblib.dump(model, 'matchmaker_model.pkl')
print("Model successfully saved as 'matchmaker_model.pkl'")
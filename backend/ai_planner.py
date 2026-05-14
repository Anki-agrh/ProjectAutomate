import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load the secret API key from your .env file
load_dotenv()

# The new SDK automatically looks for the GEMINI_API_KEY in your environment!
client = genai.Client()

def break_down_project(project_description: str):
    """Sends the project description to Gemini and returns a JSON list of tasks."""
    
    print(f"[AI] Asking AI to plan: {project_description}...")

    prompt = f"""
    You are an expert technical Agile Product Manager. 
    Your job is to architect a technical execution plan for the following project.

    Project Description: {project_description}

    INSTRUCTIONS:
    1. Strictly Break down the project into 3 to 5 major technical phases at first then move to subtask.
    2. Inside each phase, define 2 to 4 highly specific, actionable subtasks.
    3. You MUST return ONLY a valid JSON array of objects. Do not include any markdown formatting, preamble, or ```json code blocks.

    EXPECTED JSON SCHEMA:
    [
      {{
        "phase_title": "A short string describing the major task",
        "subtasks": [
          {{
            "title": "A short, clear technical subtask name",
            
            "required_skills": ["react", "node", "mongodb"],
            "estimated_days": "INTEGER: Estimate how many days this will take (e.g., 2, 5, 10)"
          }}
        ]
      }}
    ]
    """

    # Using the new SDK syntax to call the model and force JSON output
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    
    # Convert the AI's text response back into an actual Python list/dictionary
    raw_text = response.text
    
    # 🚨 CLEANUP HACK: Remove markdown backticks and 'json' keyword
    cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
    
    # Ek aur safety check
    if cleaned_text.startswith("`"):
        cleaned_text = cleaned_text.strip("`")

    # Ab safely load karo
    try:
        tasks_data = json.loads(cleaned_text)
    except Exception as e:
        print(f"FAILED TO PARSE JSON. Here is what Gemini sent:\n{raw_text}")
        raise e
        
    return tasks_data

# --- Quick Test Block ---
if __name__ == "__main__":
    test_project = "Build a full-stack e-commerce app with payment integration."
    generated_tasks = break_down_project(test_project)
    
    print("\n[OK] AI Response Received!")
    print(json.dumps(generated_tasks, indent=4))
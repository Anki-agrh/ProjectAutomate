# ProjectAutomate (ScrumMaster)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

ProjectAutomate is an intelligent, AI-powered project management platform designed to streamline task delegation, workload balancing, and sprint planning using Machine Learning and Generative AI.

## Live Demo
- **URL:** [https://project-automate-swart.vercel.app/]
- **Demo Credentials:** 
  - **Email:** admin@scrummaster.com
  - **Password:** admin

## Problem Statement
Project managers often spend a significant amount of time manually assigning tasks to team members, balancing workloads, and planning project sprints. Manual assignment can lead to inefficiencies, mismatched skill sets, and employee burnout. ProjectAutomate solves this by leveraging AI and Machine Learning to intelligently assign tasks based on employee skills, current workload, and past performance.

## Why I Built This
I built ProjectAutomate to bridge the gap between traditional project management tools and modern AI capabilities. Recognizing the repetitive nature of sprint planning and task assignment, I wanted to create a solution that not only manages tasks but *actively recommends* who should do them, saving managers hours of administrative work and improving team efficiency.

## Key Features
- **AI Task Assignment:** Uses a Scikit-Learn ML model to recommend the best employee for a task based on skills, domain, and experience.
- **Generative AI Sprint Planning:** Leverages Google GenAI to automatically break down high-level project goals into actionable, granular tasks.
- **Multi-Tenancy Support:** Secure data isolation allowing multiple managers to manage their respective teams and projects within the same application.
- **Employee Performance Tracking:** Records reliability scores over time to ensure tasks are assigned to the most dependable team members.
- **Interactive Dashboards:** Real-time metrics and beautiful visualizations using Recharts and Framer Motion.

## Architecture Flow Diagram

```mermaid
flowchart LR
    A[React UI] -- Axios --> B[FastAPI Routes]
    B --> C{Business Logic}
    C -- Matches tasks --> D[Scikit-Learn ML]
    C -- Plans sprints --> E[Gemini API]
    C -- Queries --> F[(PostgreSQL)]
    
    D -.-> C
    E -.-> C
    F -.-> C
    
    C -- JSON Response --> A
```


## API Overview
The backend exposes comprehensive RESTful endpoints under these main routers:
- `/auth/`: User registration, login, and JWT token generation.
- `/projects/`: CRUD operations for managing projects.
- `/tasks/`: Task creation, status updates, and AI-driven task assignment endpoints.
- `/employees/`: Employee management and skill profiling.
- `/manager/`: Multi-tenant operations specific to managers.
- `/analytics/`: Data aggregation for frontend charts and performance metrics.

## Database Schema
The database (PostgreSQL) is managed via SQLAlchemy ORM. The main entities are:
- **Employee:** Stores user details, skills (JSONB), role, experience, and average quality scores.
- **Project:** Stores project metadata and links to the manager.
- **Task:** Represents individual work items. Contains `required_skills`, `deadline`, and foreign keys to `Project` and `Employee`.
- **ReliabilityHistory:** Tracks an employee's reliability score over time for performance analytics.

*Entity Relationship Overview:*
- A **Manager** (Employee) manages multiple **Projects** and **Employees**.
- A **Project** contains multiple **Tasks**.
- An **Employee** is assigned multiple **Tasks**.
- An **Employee** has a one-to-many relationship with **ReliabilityHistory**.

## Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create a `.env` file in the `backend/` directory with the following variables. *(Note: Do not commit actual secrets to version control!)*

- **GEMINI_API_KEY**: Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **DATABASE_URL**: Use your local PostgreSQL connection string, or get a free managed database from [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
- **SECRET_KEY**: Generate a secure random string (e.g., run `openssl rand -hex 32`).

```env
# Google Gemini API Key for AI Planning
GEMINI_API_KEY=your_gemini_api_key_here

# Database Connection
DATABASE_URL=postgresql://user:password@localhost/dbname

# JWT Authentication
SECRET_KEY=your_jwt_secret_key
```

## Folder Structure
```text
ProjectAutomate/
├── backend/                  # Python FastAPI Backend
│   ├── routers/              # API endpoints (auth, projects, tasks, employees)
│   ├── ai_planner.py         # Google GenAI integration logic
│   ├── assignment.py         # ML-driven task assignment logic
│   ├── matchmaker_model.pkl  # Pre-trained Scikit-learn model
│   ├── database.py           # PostgreSQL connection setup
│   ├── models.py             # SQLAlchemy database models
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
└── frontend/                 # React Frontend
    ├── src/
    │   ├── api/              # Axios API service configurations
    │   ├── components/       # Reusable UI components
    │   └── pages/            # Application views/routes
    ├── public/               # Static assets
    ├── tailwind.config.js    # Tailwind configuration
    ├── vite.config.js        # Vite bundler configuration
    └── package.json          # Node.js dependencies
```

## Challenges Faced
- **ML Integration in REST API:** Serving a Scikit-Learn `.pkl` model synchronously in a high-concurrency FastAPI app was challenging. I solved this by loading the model into memory at startup and optimizing the inference logic.
- **Prompt Engineering for Consistent JSON:** Google GenAI occasionally returned non-standard JSON formats. I solved this by strictly enforcing JSON schema instructions in the system prompts within `ai_planner.py` and implementing robust parsing logic.
- **Complex SQLAlchemy Queries:** Calculating real-time employee reliability scores required complex joins. I solved this by denormalizing some data and adding the `ReliabilityHistory` table for efficient time-series querying.

## Roadmap
- Basic CRUD for Projects and Tasks
- AI-powered Task Breakdown using Gemini
- ML-based Task Assignment Recommendations
- Add WebSocket support for real-time task board updates
- Implement advanced Role-Based Access Control (RBAC)
- Export Analytics to PDF/CSV

## Future Improvements
- **Third-Party Integrations:** Connect with Slack or Microsoft Teams for automatic notifications when tasks are assigned.
- **Advanced Model Retraining:** Implement a pipeline to automatically retrain the matchmaking model based on newly completed tasks and manager feedback.

## Real Application Screenshots

### Dashboard
![Dashboard](frontend/public/dashboard.png)

### Employee Directory
![Employee Directory](frontend/public/employee_directory.png)

### AI Planning View
![AI Planning](frontend/public/ai_planning.png)

## What I Learned
Building this project provided valuable experience across the full stack:
- **Machine Learning Integration:** Learned how to deploy a pre-trained scikit-learn model within a FastAPI backend to make real-time predictions for task assignments, bridging the gap between data science and web engineering.
- **Generative AI & Prompt Engineering:** Gained experience using Google GenAI APIs to automate complex project planning logic, mastering how to constrain LLM outputs to structured JSON formats.
- **Modern Frontend Development:** Deepened my knowledge of building fast, responsive user interfaces using React 19, Vite, and Tailwind CSS. Implemented complex state management for the interactive dashboards.
- **Database Management & Multi-Tenancy:** Improved my skills in modeling complex relational data, specifically implementing a multi-tenant architecture using SQLAlchemy and PostgreSQL where managers act as isolated tenants.
- **API Design & Security:** Mastered the creation of robust, well-documented REST APIs using FastAPI's dependency injection and routing system, securing them with robust JWT-based authentication.



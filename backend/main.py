from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
import analytics
from routers import auth, projects, tasks, employees, manager

# This ensures tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ScrumMaster Backend API")

# Add CORS so React can talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(employees.router)
app.include_router(manager.router)

@app.get("/")
def read_root():
    return {"message": "ScrumMaster Backend is running successfully!"}
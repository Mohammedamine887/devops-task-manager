from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, get_db
from .models import Task
from .schemas import TaskCreate, TaskUpdate, TaskResponse


Base.metadata.create_all(bind=engine)

app = FastAPI(title="DevOps Task Manager")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost",
    "http://localhost:8080",

],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "DevOps Task Manager API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()


@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(title=task.title)

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task
@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title is not None:
        task.title = task_update.title

    if task_update.completed is not None:
        task.completed = task_update.completed

    db.commit()
    db.refresh(task)

    return task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}
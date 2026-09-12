import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [tasks, setTasks] = useState([]);
const [title, setTitle] = useState("");
const [editingTaskId, setEditingTaskId] = useState(null);
const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((response) => response.json())
      .then((data) => setTasks(data));
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;

    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
      }),
    });

    const newTask = await response.json();

    setTasks([...tasks, newTask]);
    setTitle("");
  };
  const toggleTask = async (task) => {
    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !task.completed,
      }),
    });
  
    const updatedTask = await response.json();
  
    setTasks(
      tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };
  
  const deleteTask = async (taskId) => {
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });
  
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };
  
  const saveEdit = async (taskId) => {
    if (!editTitle.trim()) return;
  
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
      }),
    });
  
    const updatedTask = await response.json();
  
    setTasks(
      tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  
    setEditingTaskId(null);
    setEditTitle("");
  };
  return (
    <div className="app">
      <h1>DevOps Task Manager</h1>

      <div className="task-form">
        <input
          type="text"
          placeholder="Enter a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="tasks">
  {tasks.map((task) => (
    <div className="task" key={task.id}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task)}
      />

      {editingTaskId === task.id ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <button onClick={() => saveEdit(task.id)}>
            Save
          </button>

          <button onClick={() => setEditingTaskId(null)}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <span
            style={{
              textDecoration: task.completed ? "line-through" : "none",
            }}
          >
            {task.title}
          </span>

          <button onClick={() => startEditing(task)}>
            Edit
          </button>

          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </>
      )}
    </div>
  ))}
</div>
    </div>
  );
}

export default App;
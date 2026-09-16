const STORAGE_KEY = "class-todo-items";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const priorityInput = document.querySelector("#priority-input");
const list = document.querySelector("#todo-list");
const remainingCount = document.querySelector("#remaining-count");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll("[data-filter]");

const priorityLabels = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved.map(normalizeTodo);
  } catch (_) {}

  return [
    { id: crypto.randomUUID(), title: "강의 자료 만들기", completed: false, priority: "high" },
    { id: crypto.randomUUID(), title: "이메일 답장하기", completed: true, priority: "medium" },
    { id: crypto.randomUUID(), title: "운동하기", completed: false, priority: "low" },
  ];
}

function normalizeTodo(todo) {
  const priority = priorityLabels[todo.priority] ? todo.priority : "medium";
  return { ...todo, priority };
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  visibleTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `${todo.title} 완료 여부`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = todo.title;

    const priority = document.createElement("span");
    priority.className = `priority priority-${todo.priority}`;
    priority.textContent = priorityLabels[todo.priority];

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkbox, title, priority, deleteButton);
    list.appendChild(item);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `${remaining}개의 할 일 남음`;
  emptyState.hidden = visibleTodos.length > 0;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function addTodo(title, priority) {
  todos.unshift({ id: crypto.randomUUID(), title, completed: false, priority });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;

  addTodo(title, priorityInput.value);
  input.value = "";
  priorityInput.value = "medium";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

render();

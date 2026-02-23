const STORAGE_KEY = 'planner.tasks.v1';

const taskForm = document.querySelector('#task-form');
const taskTitleInput = document.querySelector('#task-title');
const taskDateInput = document.querySelector('#task-date');
const taskPriorityInput = document.querySelector('#task-priority');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const template = document.querySelector('#task-item-template');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const clearCompletedButton = document.querySelector('#clear-completed');

let tasks = loadTasks();
let activeFilter = 'all';

render();

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    dueDate: taskDateInput.value,
    priority: taskPriorityInput.value,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  saveTasks();
  taskForm.reset();
  taskPriorityInput.value = 'medium';
  taskTitleInput.focus();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    render();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  taskList.innerHTML = '';
  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const clone = template.content.cloneNode(true);
    const item = clone.querySelector('.task-item');
    const checkbox = clone.querySelector('input[type="checkbox"]');
    const title = clone.querySelector('.task-item__title');
    const details = clone.querySelector('.task-item__details');
    const priorityText = `<span class="priority ${task.priority}">${capitalize(task.priority)}</span>`;
    const dueText = task.dueDate
      ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'No due date';

    item.classList.toggle('completed', task.completed);
    checkbox.checked = task.completed;
    title.textContent = task.title;
    details.innerHTML = `${priorityText} • ${dueText}`;

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    clone.querySelector('.delete-btn').addEventListener('click', () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      render();
    });

    taskList.append(clone);
  });

  emptyState.hidden = visibleTasks.length > 0;
}

function getVisibleTasks() {
  if (activeFilter === 'all') return tasks;
  return tasks.filter((task) => task.priority === activeFilter);
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

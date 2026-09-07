const DURATIONS = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const timeEl = document.getElementById("time");
const startPauseBtn = document.getElementById("start-pause");
const resetBtn = document.getElementById("reset");
const modeTabs = document.querySelectorAll(".mode-tab");
const cycleCountEl = document.getElementById("cycle-count");
const themeToggle = document.getElementById("theme-toggle");
const noteForm = document.getElementById("note-form");
const noteInput = document.getElementById("note-input");
const noteList = document.getElementById("note-list");

let mode = "work";
let secondsLeft = DURATIONS[mode];
let timerId = null;
let cyclesCompleted = Number(localStorage.getItem("pomodoro-cycles") || 0);

cycleCountEl.textContent = `Ciclos completados: ${cyclesCompleted}`;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function render() {
  timeEl.textContent = formatTime(secondsLeft);
  document.title = `${formatTime(secondsLeft)} - Pomodoro`;
}

function switchMode(newMode) {
  mode = newMode;
  secondsLeft = DURATIONS[mode];
  modeTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  render();
}

function playChime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

function tick() {
  secondsLeft -= 1;
  if (secondsLeft <= 0) {
    playChime();
    if (mode === "work") {
      cyclesCompleted += 1;
      localStorage.setItem("pomodoro-cycles", cyclesCompleted);
      cycleCountEl.textContent = `Ciclos completados: ${cyclesCompleted}`;
      switchMode(cyclesCompleted % 4 === 0 ? "long" : "short");
    } else {
      switchMode("work");
    }
    stopTimer();
    startPauseBtn.textContent = "Iniciar";
    return;
  }
  render();
}

function startTimer() {
  timerId = setInterval(tick, 1000);
  startPauseBtn.textContent = "Pausar";
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

startPauseBtn.addEventListener("click", () => {
  if (timerId) {
    stopTimer();
    startPauseBtn.textContent = "Iniciar";
  } else {
    startTimer();
  }
});

resetBtn.addEventListener("click", () => {
  stopTimer();
  secondsLeft = DURATIONS[mode];
  startPauseBtn.textContent = "Iniciar";
  render();
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    stopTimer();
    startPauseBtn.textContent = "Iniciar";
    switchMode(tab.dataset.mode);
  });
});

// Theme toggle
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("pomodoro-theme", theme);
}

const savedTheme = localStorage.getItem("pomodoro-theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
});

// Notes
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem("pomodoro-notes") || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem("pomodoro-notes", JSON.stringify(notes));
}

function renderNotes() {
  const notes = loadNotes();
  noteList.innerHTML = "";
  if (notes.length === 0) {
    const hint = document.createElement("li");
    hint.className = "empty-hint";
    hint.textContent = "Sin tareas todavía. ¡Añade una!";
    noteList.appendChild(hint);
    return;
  }
  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.className = "note-item" + (note.done ? " done" : "");

    const span = document.createElement("span");
    span.textContent = note.text;
    span.addEventListener("click", () => {
      const current = loadNotes();
      current[index].done = !current[index].done;
      saveNotes(current);
      renderNotes();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => {
      const current = loadNotes();
      current.splice(index, 1);
      saveNotes(current);
      renderNotes();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    noteList.appendChild(li);
  });
}

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = noteInput.value.trim();
  if (!text) return;
  const notes = loadNotes();
  notes.push({ text, done: false });
  saveNotes(notes);
  noteInput.value = "";
  renderNotes();
});

render();
renderNotes();

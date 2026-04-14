// ── Habits ───────────────────────────────────────────────────
const HABITS = [
  "Mindfulness",
  "Workout",
  "Reading — 30 min",
  "Ice roller",
  "Green tea",
];

function renderHabits() {
  const list = document.getElementById("habit-list");
  list.innerHTML = "";
  HABITS.forEach((h, i) => {
    const saved = localStorage.getItem(`habit_${i}`) === "true";
    const el = document.createElement("label");
    el.className = "habit-item" + (saved ? " checked" : "");
    el.innerHTML = `<input type="checkbox" ${saved ? "checked" : ""}/><div class="habit-box"></div><span>${h}</span>`;
    el.querySelector("input").addEventListener("change", (e) => {
      localStorage.setItem(`habit_${i}`, e.target.checked);
      el.classList.toggle("checked", e.target.checked);
    });
    list.appendChild(el);
  });
}
renderHabits();

// ── Pomodoro (timestamp-based timer — accurate across tab switches) ──
let TOTAL = 25 * 60;
let timeLeft = TOTAL;
let ticker = null;
let running = false;
let sessionCount = 0;
let currentModeLabel = "Focus";
let timerEndTime = null; // wall-clock timestamp when timer completes

const ring = document.getElementById("ring");
const r = 48;
const circ = r * 2 * Math.PI;
ring.style.strokeDasharray = `${circ} ${circ}`;
ring.style.strokeDashoffset = 0;

function setRing(pct) {
  ring.style.strokeDashoffset = circ - (pct / 100) * circ;
}

function updateDisplay() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  document.getElementById("pomodoro-time").textContent = `${m}:${s}`;
  setRing((timeLeft / TOTAL) * 100);
}

function setPreset(minutes, btn) {
  if (running) {
    clearInterval(ticker);
    running = false;
  }
  TOTAL = minutes * 60;
  timeLeft = TOTAL;
  timerEndTime = null;
  if (minutes <= 10) currentModeLabel = "Short Break";
  else if (minutes <= 20) currentModeLabel = "Long Break";
  else currentModeLabel = "Focus";
  document.getElementById("timer-mode").textContent = currentModeLabel;
  document
    .querySelectorAll(".preset-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.getElementById("timer-btn").textContent = "Start";
  updateDisplay();
}

function setCustomTime() {
  const val = parseInt(document.getElementById("custom-time").value);
  if (!val || val < 1 || val > 180) return;
  document
    .querySelectorAll(".preset-btn")
    .forEach((b) => b.classList.remove("active"));
  currentModeLabel = "Custom";
  document.getElementById("timer-mode").textContent = "Custom";
  if (running) {
    clearInterval(ticker);
    running = false;
  }
  TOTAL = val * 60;
  timeLeft = TOTAL;
  timerEndTime = null;
  document.getElementById("timer-btn").textContent = "Start";
  updateDisplay();
}

function toggleTimer() {
  const btn = document.getElementById("timer-btn");
  if (running) {
    clearInterval(ticker);
    // Capture exact remaining time from wall clock
    timeLeft = Math.max(0, Math.round((timerEndTime - Date.now()) / 1000));
    btn.textContent = "Resume";
    running = false;
  } else {
    // Set end time relative to now + remaining seconds
    timerEndTime = Date.now() + timeLeft * 1000;
    ticker = setInterval(() => {
      // Always derive remaining from wall clock — immune to tab throttling
      const remaining = Math.round((timerEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        timeLeft = 0;
        updateDisplay();
        clearInterval(ticker);
        running = false;
        timerEndTime = null;
        sessionCount++;
        document.getElementById("session-count").textContent = sessionCount;
        btn.textContent = "Start";
        alert(`${currentModeLabel} session complete!`);
        timeLeft = TOTAL;
        updateDisplay();
      } else {
        timeLeft = remaining;
        updateDisplay();
      }
    }, 500); // Poll every 500ms — still accurate even when throttled
    btn.textContent = "Pause";
    running = true;
  }
}

function resetTimer() {
  clearInterval(ticker);
  timeLeft = TOTAL;
  timerEndTime = null;
  running = false;
  document.getElementById("timer-btn").textContent = "Start";
  updateDisplay();
}
updateDisplay();

// ── Clock & Date ──────────────────────────────────────────────
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");
  document.getElementById("dateline").textContent =
    DAYS[now.getDay()] +
    ", " +
    MONTHS[now.getMonth()] +
    " " +
    String(now.getDate()).padStart(2, "0");
}
setInterval(updateClock, 1000);
updateClock();

// ── Global Search ────────────────────────────────────────────────────────
const searchInput = document.getElementById("global-search");

// Auto-focus when typing anywhere on the page
document.addEventListener("keydown", (e) => {
  if (
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA"
  ) {
    return;
  }

  if (e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key.length === 1) {
    searchInput.focus();
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  }
});

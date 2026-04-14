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

// ── Calendars ─────────────────────────────────────────────────
function expandRecurringEvents(events, maxDaysToExpand = 14) {
  const expanded = [];
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const limitDate = new Date(
    startOfToday.getTime() + maxDaysToExpand * 24 * 60 * 60 * 1000,
  );

  events.forEach((event) => {
    // Fix: If it's NOT a recurring event, push it and move on.
    if (!event.rrule) {
      if (
        event.start >= startOfToday ||
        (event.allDay && isSameDay(event.start, now))
      ) {
        expanded.push(event);
      }
      return;
    }

    // If it IS a recurring event, parse the rules
    const rules = {};
    event.rrule.split(";").forEach((p) => {
      const [k, v] = p.split("=");
      rules[k] = v;
    });

    let untilDate = null;
    if (rules.UNTIL) {
      untilDate = parseICSTime(rules.UNTIL).date;
    }

    let maxCount = rules.COUNT ? parseInt(rules.COUNT) : null;
    let currentCount = 1;

    if (rules.FREQ === "WEEKLY" || rules.FREQ === "DAILY") {
      let currentStart = new Date(event.start);
      const duration = event.end
        ? event.end.getTime() - event.start.getTime()
        : 0;

      for (let i = 0; i < maxDaysToExpand * 52; i++) {
        if (i > 0) {
          currentStart.setDate(currentStart.getDate() + 1);
        }

        if (currentStart > limitDate) break;
        if (untilDate && currentStart > untilDate) break;

        let matches = false;
        if (rules.FREQ === "DAILY") {
          matches = true;
        } else if (rules.FREQ === "WEEKLY") {
          if (rules.BYDAY) {
            const dayMap = {
              SU: 0,
              MO: 1,
              TU: 2,
              WE: 3,
              TH: 4,
              FR: 5,
              SA: 6,
            };
            const targetDays = rules.BYDAY.split(",").map(
              (d) => dayMap[d.replace(/[0-9-]/g, "")],
            );
            if (targetDays.includes(currentStart.getDay())) matches = true;
          } else {
            if (currentStart.getDay() === event.start.getDay()) matches = true;
          }
        }

        if (matches) {
          if (maxCount !== null && currentCount > maxCount) break;

          if (currentStart >= startOfToday) {
            expanded.push({
              ...event,
              start: new Date(currentStart),
              end: event.end
                ? new Date(currentStart.getTime() + duration)
                : null,
            });
          }
          currentCount++;
        }
      }
    }
  });

  return expanded;
}

const calendars = [
  {
    name: "Private",
    url: "https://p168-caldav.icloud.com/published/2/MTAwMDIxNTEzMTIxMDAwMnULAWWeM4R3QYo4reFBVkCmlvqcwqHmGXEHMfBOpcr7d0-ONDtxECNPWMfN7pvS_C0_OqpJwPNL0b4C8SRPGmY",
    colorClass: "dark-green",
  },
  {
    name: "Exams",
    url: "https://p168-caldav.icloud.com/published/2/MTAwMDIxNTEzMTIxMDAwMnULAWWeM4R3QYo4reFBVkAOEMf7v8Z8Hkcnjo0oOQyeqn_UGv3TLQlhEr5mN7xLG5okW3cF4_CvGfCHYVvvdBA",
    colorClass: "orange",
  },
  {
    name: "Holidays",
    url: "https://p168-caldav.icloud.com/published/2/MTAwMDIxNTEzMTIxMDAwMnULAWWeM4R3QYo4reFBVkCfwdbdu3LI7iiPjmFpKAdwbPJ8Su9o-lw-PNGenqJMIDAY_DkYX7wUZczyAbkK9G8",
    colorClass: "yellow",
  },
  {
    name: "School",
    url: "https://p168-caldav.icloud.com/published/2/MTAwMDIxNTEzMTIxMDAwMnULAWWeM4R3QYo4reFBVkC0WuIMLarWx6-sl4FVEhVW0cJwAdPUB0hOujpXACsaAgMbguioo9ic4d5-jUts5MM",
    colorClass: "dark-blue",
  },
  {
    name: "Work",
    url: "https://p168-caldav.icloud.com/published/2/MTAwMDIxNTEzMTIxMDAwMnULAWWeM4R3QYo4reFBVkCfwdbdu3LI7iiPjmFpKAdwbPJ8Su9o-lw-PNGenqJMIDAY_DkYX7wUZczyAbkK9G8",
    colorClass: "gold",
  },
];

async function fetchAppleCalendars() {
  let failedCalendars = [];
  const fetchPromises = calendars.map(async (calendar) => {
    try {
      const proxyUrl =
        "https://corsproxy.io/?" + encodeURIComponent(calendar.url);
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error();
      const icsData = await response.text();
      return parseICS(icsData, calendar.colorClass);
    } catch {
      failedCalendars.push(calendar.name);
      return [];
    }
  });

  try {
    const allResults = await Promise.all(fetchPromises);
    let allEvents = allResults.flat();

    allEvents = expandRecurringEvents(allEvents, 14);

    allEvents.sort((a, b) => a.start - b.start);

    const validEvents = allEvents.filter((e) => {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      return e.start >= startOfToday;
    });

    renderEvents(validEvents, failedCalendars);
  } catch (error) {
    console.error("Critical error:", error);
  }
}

function parseICS(icsString, colorClass) {
  const lines = icsString.split(/\r\n|\n|\r/);
  const events = [];
  let currentEvent = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = { allDay: false };
    } else if (line.startsWith("END:VEVENT")) {
      if (currentEvent && currentEvent.start) {
        currentEvent.colorClass = colorClass;
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const firstColon = line.indexOf(":");
      if (firstColon === -1) continue;
      const prop = line.substring(0, firstColon);
      const val = line.substring(firstColon + 1);
      if (prop.startsWith("SUMMARY")) {
        currentEvent.title = val;
      } else if (prop.startsWith("DTSTART")) {
        const res = parseICSTime(val);
        currentEvent.start = res.date;
        if (res.isAllDay) currentEvent.allDay = true;
      } else if (prop.startsWith("DTEND")) {
        currentEvent.end = parseICSTime(val).date;
      } else if (prop.startsWith("RRULE")) {
        currentEvent.rrule = val;
      }
    }
  }
  return events;
}

function parseICSTime(dateStr) {
  if (!dateStr) return { date: new Date(), isAllDay: false };
  const y = parseInt(dateStr.substring(0, 4)),
    m = parseInt(dateStr.substring(4, 6)) - 1,
    d = parseInt(dateStr.substring(6, 8));
  if (dateStr.length <= 8)
    return { date: new Date(y, m, d, 0, 0, 0), isAllDay: true };
  const h = parseInt(dateStr.substring(9, 11)),
    min = parseInt(dateStr.substring(11, 13)),
    s = parseInt(dateStr.substring(13, 15));
  const date = dateStr.endsWith("Z")
    ? new Date(Date.UTC(y, m, d, h, min, s))
    : new Date(y, m, d, h, min, s);
  return { date, isAllDay: false };
}

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getDayLabel(date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getTitleColorClass(title) {
  if (!title) return "";
  const t = title.toUpperCase();
  if (t.startsWith("[CW]") || t.startsWith("[ĆW]")) return "title-cw";
  if (t.startsWith("[LAB]")) return "title-lab";
  if (t.startsWith("[PROJ]") || t.startsWith("[PRO]")) return "title-proj";
  if (t.startsWith("[WYK]")) return "title-wyk";
  if (
    t.startsWith("[KOLOS]") ||
    t.startsWith("[KOLOS 1]") ||
    t.startsWith("[KOLOS 2]") ||
    t.startsWith("[EGZAMIN]")
  )
    return "title-alert";
  if (t.startsWith("[IMPORTANT]") || t.startsWith("[IMP]"))
    return "title-important";
  return "";
}

function renderEvents(events, failedCalendars) {
  const dayContainer = document.getElementById("day-view-container");
  const cardLabel = document.getElementById("cal-card-label");
  const listContainer = document.getElementById("upcoming-list-container");
  dayContainer.innerHTML = "";
  listContainer.innerHTML = "";
  const now = new Date();
  const hourHeight = 60;

  const grid = document.createElement("div");
  grid.className = "day-grid";

  for (let i = 0; i <= 23; i++) {
    const hourDiv = document.createElement("div");
    hourDiv.className = "hour-block";
    let label;
    if (i === 0) label = "12 AM";
    else if (i === 12) label = "12 PM";
    else if (i > 12) label = i - 12 + " PM";
    else label = i + " AM";
    hourDiv.innerHTML = `<span class="hour-text">${label}</span>`;
    grid.appendChild(hourDiv);
  }
  dayContainer.appendChild(grid);

  let todayEvents = events.filter((e) => isSameDay(e.start, now));
  let futureEvents = events.filter((e) => !isSameDay(e.start, now));

  const seenToday = new Set();
  todayEvents = todayEvents.filter((item) => {
    const compositeKey = `${item.start}-${item.end}-${item.title}`;
    if (seenToday.has(compositeKey)) {
      return false;
    }
    seenToday.add(compositeKey);
    return true;
  });

  const seenFuture = new Set();
  futureEvents = futureEvents.filter((item) => {
    const compositeKey = `${item.start}-${item.end}-${item.title}`;
    if (seenFuture.has(compositeKey)) {
      return false;
    }
    seenFuture.add(compositeKey);
    return true;
  });

  let allDayCount = 0;
  console.log("todayEvents", todayEvents);
  console.log("futureEvents", futureEvents);

  todayEvents.forEach((event) => {
    const extraClass = event.colorClass ? ` ${event.colorClass}` : "";
    const titlePrefixClass = getTitleColorClass(event.title);

    if (event.allDay) {
      const topOffset = allDayCount * 32;
      dayContainer.insertAdjacentHTML(
        "beforeend",
        `<div class="day-event-block all-day-event${extraClass}" style="position: sticky; top: ${topOffset}px; height: 30px; width: calc(100% - 12px); z-index: 15; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                              <div class="title ${titlePrefixClass}" style="font-size:10px;">☀️ All Day: ${event.title}</div>
                            </div>`,
      );
      allDayCount++;
    } else {
      const startMins = event.start.getHours() * 60 + event.start.getMinutes();
      const duration = (event.end - event.start) / (1000 * 60);
      const top = (startMins / 60) * hourHeight;
      const height = Math.max((duration / 60) * hourHeight, 22);

      cardLabel.insertAdjacentHTML(
        "beforeend",
        `<div class="day-event-block${extraClass}" style="top:${top}px;height:${height}px;">
                              <div class="title ${titlePrefixClass}">${event.title}</div>
                            </div>`,
      );
    }
  });

  // --- Automatic Scrolling & Timeline Marker Logic ---
  function updateTimeline() {
    const currentTime = new Date();
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nowTop = (currentMins / 60) * hourHeight;

    let timeline = grid.querySelector(".timeline-now");
    if (!timeline) {
      timeline = document.createElement("div");
      timeline.className = "timeline-now";
      grid.appendChild(timeline);
    }
    timeline.style.top = `${nowTop}px`;

    // Smooth scroll to the updated time
    dayContainer.scrollTo({
      top: nowTop - 100,
      behavior: "smooth",
    });
  }

  // Call it immediately on load
  updateTimeline();

  // Clear any existing interval to prevent duplicates on refresh, then set a new one to update every 60 seconds
  if (window.calendarScrollInterval)
    clearInterval(window.calendarScrollInterval);
  window.calendarScrollInterval = setInterval(updateTimeline, 60000);

  // --- Render Future Events ---
  if (failedCalendars.length > 0) {
    listContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="cal-event" style="border-left-color:#ff3b30;font-size:9px;padding:4px 8px;margin-bottom:8px;">Warning: ${failedCalendars.join(", ")} failed.</div>`,
    );
  }

  let lastLabel = "";
  futureEvents.slice(0, 5).forEach((event) => {
    const label = getDayLabel(event.start);
    if (label !== lastLabel) {
      listContainer.insertAdjacentHTML(
        "beforeend",
        `<div class="cal-day-label">${label}</div>`,
      );
      lastLabel = label;
    }
    const extraClass = event.colorClass ? ` ${event.colorClass}` : "";
    const timeString = event.allDay
      ? "All Day"
      : `${formatTime(event.start)} – ${formatTime(event.end)}`;
    const titlePrefixClass = getTitleColorClass(event.title);

    listContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="cal-event${extraClass}">
                          <div class="cal-time">${timeString}</div>
                          <div class="cal-title ${titlePrefixClass}">${event.title}</div>
                        </div>`,
    );
  });

  if (events.length === 0) {
    listContainer.innerHTML = `<div class="cal-event"><div class="cal-title">No events scheduled</div></div>`;
  }
}

fetchAppleCalendars();

// ── Spotify ─────────────────────────────────────────────────
const CLIENT_ID = "778fe57066b24fb3b9c8ef6c48afe754";
const REDIRECT_URI =
  "https://karolborecki.github.io/setup/dashboard/index.html";
const SCOPES =
  "user-read-currently-playing user-read-playback-state user-modify-playback-state";
let accessToken = null;

function generateRandomString(length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function authenticateSpotify() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  window.localStorage.setItem("code_verifier", codeVerifier);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}

function setSpotifyIdleState() {
  document.getElementById("track-name").textContent = "Nothing playing";
  document.getElementById("track-name").className = "spotify-track idle";
  document.getElementById("artist-name").textContent = "–";
  document.getElementById("album-art").style.display = "none";
  document.getElementById("album-placeholder").style.display = "flex";
  document.getElementById("play-pause-btn").textContent = "⏯";
  document.getElementById("play-pause-btn").disabled = true;
  document.getElementById("btn-prev").disabled = true;
  document.getElementById("btn-next").disabled = true;
  document.getElementById("spotify-queue").innerHTML =
    `<div class="spotify-connect-hint">Waiting for playback…</div>`;
}

function setSpotifyActiveState(trackName, artistName, albumArtUrl) {
  document.getElementById("track-name").textContent = trackName;
  document.getElementById("track-name").className = "spotify-track";
  document.getElementById("artist-name").textContent = artistName;
  const albumArt = document.getElementById("album-art");
  albumArt.src = albumArtUrl;
  albumArt.style.display = "block";
  document.getElementById("album-placeholder").style.display = "none";
  document.getElementById("play-pause-btn").disabled = false;
  document.getElementById("btn-prev").disabled = false;
  document.getElementById("btn-next").disabled = false;
}

async function initSpotify() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (code) {
    accessToken = await getAccessToken(code);
    if (accessToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchNowPlaying();
      setInterval(fetchNowPlaying, 5000);
    } else {
      authenticateSpotify();
    }
  } else {
    authenticateSpotify();
  }
}

let isPlaying = false;

async function fetchNowPlaying() {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (response.status === 204 || response.status > 400) {
      setSpotifyIdleState();
      isPlaying = false;
      return;
    }
    const data = await response.json();
    if (!data || !data.item) {
      setSpotifyIdleState();
      isPlaying = false;
      return;
    }
    isPlaying = data.is_playing;
    document.getElementById("play-pause-btn").textContent = isPlaying
      ? "⏸"
      : "▶";
    setSpotifyActiveState(
      data.item.name,
      data.item.artists.map((a) => a.name).join(", "),
      data.item.album.images[0].url,
    );
    fetchSpotifyQueue();
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    setSpotifyIdleState();
  }
}

async function controlSpotify(action) {
  let endpoint = "",
    method = "POST";
  if (action === "next") endpoint = "next";
  if (action === "previous") endpoint = "previous";
  if (action === "play/pause") {
    endpoint = isPlaying ? "pause" : "play";
    method = "PUT";
  }
  try {
    await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setTimeout(fetchNowPlaying, 500);
  } catch (error) {
    console.error("Error controlling Spotify:", error);
  }
}

async function fetchSpotifyQueue() {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/queue", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return;
    const data = await response.json();
    const queueContainer = document.getElementById("spotify-queue");
    queueContainer.innerHTML = "";
    if (!data.queue || data.queue.length === 0) {
      queueContainer.innerHTML = `<div class="spotify-connect-hint">Queue is empty</div>`;
      return;
    }
    data.queue.slice(0, 4).forEach((track) => {
      const artistName = track.artists.map((a) => a.name).join(", ");
      const thumbUrl =
        track.album.images.length > 0
          ? track.album.images[track.album.images.length - 1].url
          : "";
      queueContainer.insertAdjacentHTML(
        "beforeend",
        `<div class="queue-item">
                              <img src="${thumbUrl}" class="queue-thumb" alt="art">
                              <div class="queue-details">
                                <div class="queue-track">${track.name}</div>
                                <div class="queue-artist">${artistName}</div>
                              </div>
                            </div>`,
      );
    });
  } catch (error) {
    console.error("Error fetching queue:", error);
  }
}

initSpotify();

// ── Advanced Weather ─────────────────────────────────────────
async function fetchWeather() {
  try {
    // Added 'uv_index' to the Open-Meteo API request
    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=52.2298&longitude=21.0118&current=temperature_2m,apparent_temperature,precipitation,weathercode,wind_speed_10m,relative_humidity_2m,uv_index",
    );
    const d = await r.json();
    const cur = d.current;

    const temp = Math.round(cur.temperature_2m);
    const feels = Math.round(cur.apparent_temperature);
    const wind = Math.round(cur.wind_speed_10m);
    const humidity = Math.round(cur.relative_humidity_2m);
    const precip = cur.precipitation;
    const code = cur.weathercode;
    const uvIndex = cur.uv_index; // Extract new UV data

    let textColor;
    if (temp < 0) textColor = "#9c27b0";
    else if (temp < 5) textColor = "#0288d1";
    else if (temp < 10) textColor = "#6ec6ff";
    else if (temp < 15) textColor = "#4caf78";
    else if (temp < 22) textColor = "#e8a820";
    else textColor = "#ff5252";

    document.getElementById("temp").textContent = temp + "°C";
    document.getElementById("temp").style.color = textColor;
    document.getElementById("condition").textContent = decodeWeather(code);
    document.getElementById("feels-like").textContent = `Feels like ${feels}°C`;
    document.getElementById("wind").textContent = wind + " km/h";
    document.getElementById("humidity").textContent = humidity + "%";
    document.getElementById("precip").textContent = precip + " mm";

    // Call the new advanced function with the object parameters
    const { icon, adviceString } = getAdvancedClothingAdvice({
      temp: temp,
      feels: feels,
      wind: wind,
      code: code,
      precip: precip,
      humidity: humidity,
      uvIndex: uvIndex,
      activityLevel: "sedentary", // Can be updated dynamically if you add a UI toggle later
    });

    // Update the DOM with the new structured advice
    document.getElementById("clothing-advice").textContent = adviceString;
  } catch (error) {
    console.error("Weather fetch failed:", error);
    document.getElementById("condition").textContent = "Unavailable";
  }
}

function decodeWeather(c) {
  if (c === 0) return "Clear Sky";
  if (c <= 3) return "Partly Cloudy";
  if (c <= 49) return "Foggy";
  if (c <= 69) return "Rainy";
  if (c <= 79) return "Snowy";
  if (c <= 99) return "Stormy";
  return "Unknown";
}

/**
 * Generates advanced, layered clothing advice based on comprehensive weather and activity metrics.
 * * @param {Object} params - The weather and activity parameters.
 * @param {number} params.temp - Actual temperature (°C).
 * @param {number} params.feels - Apparent/feels-like temperature (°C).
 * @param {number} params.wind - Wind speed (km/h).
 * @param {number} params.code - WMO Weather condition code.
 * @param {number} params.precip - Precipitation intensity (mm/h).
 * @param {number} [params.uvIndex=0] - UV Index (0-11+).
 * @param {number} [params.humidity=50] - Relative humidity (%).
 * @param {string} [params.activityLevel='sedentary'] - 'sedentary', 'moderate', or 'vigorous'.
 * @returns {Object} A detailed layering guide and formatted string.
 */
function getAdvancedClothingAdvice({
  temp,
  feels,
  wind,
  code,
  precip,
  uvIndex = 0,
  humidity = 50,
  activityLevel = "sedentary",
}) {
  // 1. Calculate Activity Metabolic Heat Offset
  const activityOffsets = {
    sedentary: 0,
    moderate: 6,
    vigorous: 12,
  };
  const offset = activityOffsets[activityLevel.toLowerCase()] || 0;
  const effectiveTemp = feels + offset;

  // 2. Weather Condition Flags
  const isDrizzling =
    (code >= 50 && code <= 59) || (precip > 0 && precip <= 2.5);
  const isRainingHeavy = (code >= 60 && code <= 69) || precip > 2.5;
  const isSnowy = code >= 70 && code <= 79;
  const isWindy = wind > 25;
  const isHumid = humidity > 70;
  const isSunny = code <= 3; // Clear to partly cloudy

  // 3. Layering System Initialization
  let layers = {
    base: "",
    mid: "",
    outer: "",
    bottoms: "Jeans or casual pants",
    accessories: [],
    icon: "👕",
  };

  // Material logic based on conditions
  const teeMaterial =
    isHumid || effectiveTemp > 25 || activityLevel !== "sedentary"
      ? "Moisture-wicking athletic tee"
      : "Cotton T-shirt";

  // 4. Core Temperature Logic (Using Effective Temp)
  if (effectiveTemp < -10) {
    layers.icon = "🥶";
    layers.base = "Thermal long-sleeve base layer (Merino wool/synthetic)";
    layers.mid = "Heavy fleece or thick wool sweater";
    layers.outer = "Heavy insulated parka";
    layers.bottoms = "Thermal leggings under winter-lined pants";
    layers.accessories.push("Insulated gloves", "Thick scarf", "Winter beanie");
  } else if (effectiveTemp < 5) {
    layers.icon = "🧥";
    layers.base = "Long-sleeve thermal or warm shirt";
    layers.mid = "Sweater or mid-weight fleece";
    layers.outer = "Winter coat";
    layers.bottoms = "Warm pants or jeans";
    layers.accessories.push("Light gloves", "Beanie");
  } else if (effectiveTemp < 12) {
    layers.icon = "🧥";
    layers.base = teeMaterial;
    layers.mid = "Light sweater or hoodie";
    layers.outer = "Fall/Spring jacket";
    layers.bottoms = "Pants or jeans";
  } else if (effectiveTemp < 18) {
    layers.icon = "👕";
    layers.base = teeMaterial;
    layers.mid = "Flannel or light zip-up (optional)";
    layers.bottoms = "Light chinos or jeans";
  } else if (effectiveTemp < 25) {
    layers.icon = "☀️";
    layers.base = teeMaterial;
    layers.bottoms = "Shorts or light breathable trousers";
  } else {
    layers.icon = "🔥";
    layers.base = "Breathable tank top or ultra-light tee";
    layers.bottoms = "Shorts";
  }

  // 5. Environmental Overrides (Wind, Rain, Sun)

  // Precipitation
  if (isRainingHeavy) {
    layers.icon = "⛈️";
    layers.outer =
      effectiveTemp > 18
        ? "Lightweight breathable rain shell"
        : "Waterproof hardshell jacket";
    layers.accessories.push("Sturdy Umbrella", "Waterproof footwear");
  } else if (isDrizzling) {
    layers.icon = "🌧️";
    layers.outer = layers.outer || "Water-resistant windbreaker";
    layers.accessories.push("Compact umbrella");
  } else if (isSnowy) {
    layers.icon = "❄️";
    layers.outer = layers.outer || "Water-resistant insulated jacket";
    layers.accessories.push("Waterproof winter boots");
  }

  // Wind (Only apply if it's not already raining/snowing heavily to avoid conflicting outer layers)
  if (isWindy && !isRainingHeavy && !isSnowy) {
    layers.icon = "💨";
    if (effectiveTemp < 18 && !layers.outer) {
      layers.outer = "Windbreaker";
    }
    layers.accessories.push("Wind-resistant buff or scarf");
  }

  // UV / Sun Protection
  if (uvIndex >= 5 && isSunny) {
    layers.accessories.push("Sunglasses", "Sunscreen (SPF 30+)");
    if (effectiveTemp > 15) {
      layers.accessories.push("Brimmed hat");
    }
  }

  // 5. Environmental Overrides (Modified to handle footwear separately)
  let footwear = "Comfortable sneakers"; // Default
  if (isRainingHeavy || isDrizzling) {
    footwear = "Waterproof shoes or boots";
  } else if (isSnowy || effectiveTemp < 0) {
    footwear = "Insulated winter boots";
  } else if (effectiveTemp > 25) {
    footwear = "Lightweight breathable shoes or sandals";
  }

  // 6. Final Formatting (The 4-Line Construction)
  // We extract head-related accessories for the "Head" line
  const headGear =
    layers.accessories
      .filter((a) => /hat|beanie|cap|sunglasses|scarf|buff/i.test(a))
      .join(", ") || "No headgear needed";

  // Combine upper layers into one descriptive "Shirt" line
  const upperBody = [layers.outer, layers.mid, layers.base]
    .filter(Boolean)
    .join(" + ");

  // Construct the 4 specific lines
  const line1 = `👤 ${headGear}`;
  const line2 = `👕 ${upperBody}`;
  const line3 = `👖 ${layers.bottoms}`;
  const line4 = `🥾 ${footwear}`;

  return {
    icon: layers.icon,
    adviceString: `${line1}\n${line2}\n${line3}\n${line4}`,
  };
}

fetchWeather();
setInterval(fetchWeather, 600000);

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

// ── News ─────────────────────────────────────────────────────
function renderNews(listId, items) {
  const ul = document.getElementById(listId);
  ul.innerHTML = "";
  items.forEach(({ url, title }) => {
    const li = document.createElement("li");
    li.className = "news-item";
    li.innerHTML = `<a href="${url}" target="_blank" rel="noopener">${title}</a>`;
    ul.appendChild(li);
  });
}

async function fetchWorldNews() {
  try {
    const r = await fetch(
      "https://www.reddit.com/r/worldnews/top.json?limit=7&t=day",
    );
    const d = await r.json();
    renderNews(
      "world-list",
      d.data.children.map((p) => ({
        url: "https://reddit.com" + p.data.permalink,
        title: p.data.title,
      })),
    );
  } catch {
    document.getElementById("world-list").innerHTML =
      '<div class="placeholder" style="color:#c0504a">Failed to load.</div>';
  }
}

async function fetchHN() {
  try {
    const ids = await (
      await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
    ).json();
    const stories = await Promise.all(
      ids
        .slice(0, 7)
        .map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (r) => r.json(),
          ),
        ),
    );
    renderNews(
      "hn-list",
      stories.map((s) => ({
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        title: s.title,
      })),
    );
  } catch {
    document.getElementById("hn-list").innerHTML =
      '<div class="placeholder" style="color:#c0504a">Failed to load.</div>';
  }
}

async function fetchSpace() {
  try {
    const d = await (
      await fetch("https://api.spaceflightnewsapi.net/v4/articles/?limit=7")
    ).json();
    renderNews(
      "space-list",
      d.results.map((a) => ({ url: a.url, title: a.title })),
    );
  } catch {
    document.getElementById("space-list").innerHTML =
      '<div class="placeholder" style="color:#c0504a">Failed to load.</div>';
  }
}

fetchWorldNews();
fetchHN();
fetchSpace();

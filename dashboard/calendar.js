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

    console.log("todayEvents", todayEvents);
    console.log("futureEvents", futureEvents);

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
        grid.insertAdjacentHTML(
          "beforeend",
          `<div class="day-event-block all-day-event${extraClass}" style="position: sticky; top: ${topOffset}px; height: 30px; width: calc(100% - 12px); z-index: 15; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <div class="title ${titlePrefixClass}" style="font-size:10px;">☀️ All Day: ${event.title}</div>
                                  </div>`,
        );
        allDayCount++;
      } else {
        const startMins =
          event.start.getHours() * 60 + event.start.getMinutes();
        const duration = (event.end - event.start) / (1000 * 60);
        const top = (startMins / 60) * hourHeight;
        const height = Math.max((duration / 60) * hourHeight, 22);
        grid.insertAdjacentHTML(
          "beforeend",
          `<div class="day-event-block${extraClass}" style="top:${top}px;height:${height}px;">
                    <div class="title ${titlePrefixClass}">${event.title}</div>
                  </div>`,
        );
      }
    });

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const nowTop = (currentMins / 60) * hourHeight;
    grid.insertAdjacentHTML(
      "beforeend",
      `<div class="timeline-now" style="top:${nowTop}px"></div>`,
    );
    setTimeout(() => {
      dayContainer.scrollTo({
        top: nowTop - 100,
        behavior: "smooth",
      });
    }, 500);

    if (failedCalendars.length > 0) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<div class="day-event-block all-day-event${extraClass}" style="top:0;height:30px;width:100%;z-index:10;">
              <div class="title ${titlePrefixClass}" style="font-size:10px;">☀️ All Day: ${event.title}</div>
            </div>`,
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

    dayContainer.scrollTo({
      top: nowTop - 100,
      behavior: "instant",
    });
  }

  updateTimeline();

  if (window.calendarScrollInterval)
    clearInterval(window.calendarScrollInterval);
  window.calendarScrollInterval = setInterval(updateTimeline, 60000);

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

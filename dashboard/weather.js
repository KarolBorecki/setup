// ── Advanced Weather ─────────────────────────────────────────
async function fetchWeather() {
  try {
    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=52.2298&longitude=21.0118&current=temperature_2m,apparent_temperature,precipitation,weathercode,wind_speed_10m,relative_humidity_2m",
    );
    const d = await r.json();
    const cur = d.current;
    const temp = Math.round(cur.temperature_2m);
    const feels = Math.round(cur.apparent_temperature);
    const wind = Math.round(cur.wind_speed_10m);
    const humidity = Math.round(cur.relative_humidity_2m);
    const precip = cur.precipitation;
    const code = cur.weathercode;
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
    const { icon, advice } = getClothingAdvice(temp, feels, wind, code, precip);
    document.getElementById("clothing-icon").textContent = icon;
    document.getElementById("clothing-advice").textContent = advice;
  } catch {
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

function getClothingAdvice(temp, feels, wind, code, precip) {
  const isRainy = (code >= 50 && code <= 69) || precip > 0.5;
  const isSnowy = code >= 70 && code <= 79;
  const isStormy = code >= 80;
  const isWindy = wind > 25;
  let base = "",
    icon = "👕";
  if (feels < -5) {
    base = "Heavy winter coat, thermal layers, gloves, scarf & hat.";
    icon = "🧣";
  } else if (feels < 0) {
    base = "Winter coat, gloves, scarf and a warm hat.";
    icon = "🧥";
  } else if (feels < 5) {
    base = "Heavy jacket, gloves, and layers underneath.";
    icon = "🧥";
  } else if (feels < 10) {
    base = "Warm jacket, consider a hoodie underneath.";
    icon = "🧥";
  } else if (feels < 16) {
    base = "Light jacket or thick hoodie should work.";
    icon = "🧤";
  } else if (feels < 20) {
    base = "A light layer or long sleeves will do.";
    icon = "👔";
  } else if (feels < 25) {
    base = "T-shirt weather — comfortable and mild.";
    icon = "👕";
  } else {
    base = "Lightweight, breathable clothing. Don't forget sunscreen.";
    icon = "🌞";
  }
  let extra = "";
  if (isStormy) {
    extra = " ⛈ Avoid being outside if possible.";
    icon = "⛈️";
  } else if (isSnowy) extra = " ❄️ Boots and waterproof outerwear.";
  else if (isRainy) extra = " ☂️ Take an umbrella.";
  else if (isWindy) extra = " 💨 Windbreaker recommended.";
  return { icon, advice: base + extra };
}

fetchWeather();
setInterval(fetchWeather, 600000);

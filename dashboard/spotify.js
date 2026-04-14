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

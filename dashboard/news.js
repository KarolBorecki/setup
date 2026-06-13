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

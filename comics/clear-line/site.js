const READ = "clear-line-read";
const SCORES = "clear-line-lessons";
const memory = { read: [], scores: {} };
let storeOk = true;
function readStore(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { storeOk = false; return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { storeOk = false; }
}
function load() {
  memory.read = readStore(READ, []);
  memory.scores = readStore(SCORES, {});
}
function paintRead() {
  document.querySelectorAll("[data-read]").forEach((button) => {
    const on = memory.read.includes(button.dataset.read);
    button.textContent = on ? "On your reading list" : "Mark as read";
  });
  document.querySelectorAll("[data-flag]").forEach((flag) => {
    flag.hidden = !memory.read.includes(flag.dataset.flag);
  });
}
function paintScores() {
  let done = 0;
  document.querySelectorAll("[data-score]").forEach((node) => {
    const score = memory.scores[node.dataset.score];
    if (score) { node.textContent = score.score + "/" + score.total; done += 1; }
    else node.textContent = "Not sat";
  });
  const progress = document.getElementById("lesson-progress");
  if (progress) {
    const total = document.querySelectorAll("[data-score]").length;
    progress.textContent = done + " of " + total + " lessons have a saved score on this computer.";
  }
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-read]");
  if (!button) return;
  const slug = button.dataset.read;
  memory.read = memory.read.includes(slug) ? memory.read.filter((item) => item !== slug) : memory.read.concat(slug);
  writeStore(READ, memory.read);
  paintRead();
});
const albumState = { q: "", era: "All", theme: "All" };
function filterAlbums() {
  const items = [...document.querySelectorAll("#album-list li")];
  let shown = 0;
  items.forEach((item) => {
    const hay = item.dataset.hay || "";
    const themes = (item.dataset.themes || "").split("|");
    const ok = (albumState.era === "All" || item.dataset.era === albumState.era)
      && (albumState.theme === "All" || themes.includes(albumState.theme))
      && (!albumState.q || hay.includes(albumState.q));
    item.hidden = !ok;
    if (ok) shown += 1;
  });
  const count = document.getElementById("album-count");
  const empty = document.getElementById("album-empty");
  if (count) count.textContent = shown + " shown · " + memory.read.length + " marked read on this computer";
  if (empty) empty.hidden = shown !== 0;
}
function bindChips(id, key, attr) {
  const box = document.getElementById(id);
  if (!box) return;
  box.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    albumState[key] = button.dataset[attr];
    box.querySelectorAll("button").forEach((item) => item.classList.toggle("on", item === button));
    filterAlbums();
  });
}
const bookState = { kind: "All", audience: "All" };
function filterBooks() {
  document.querySelectorAll("#book-list li").forEach((item) => {
    const kindOk = bookState.kind === "All" || item.dataset.kind === bookState.kind;
    const audienceOk = bookState.audience === "All" || item.dataset.audience === bookState.audience || item.dataset.audience === "Both";
    item.hidden = !(kindOk && audienceOk);
  });
}
function bindBookChips(id, key, attr) {
  const box = document.getElementById(id);
  if (!box) return;
  box.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    bookState[key] = button.dataset[attr];
    box.querySelectorAll("button").forEach((item) => item.classList.toggle("on", item === button));
    filterBooks();
  });
}
function mountQuiz(root) {
  const questions = JSON.parse(root.querySelector("script").textContent);
  const body = root.querySelector(".quiz-body");
  const slug = root.dataset.quiz;
  let index = 0;
  let picked = null;
  let score = 0;
  function renderDone() {
    body.innerHTML = '<p class="sub">' + score + " / " + questions.length + '</p><p class="note">Saved on this computer. Reread the passage and sit it again whenever you like — the last score replaces the old one.</p><button type="button" class="btn" data-again>Try again</button>';
    body.querySelector("[data-again]").onclick = () => { index = 0; picked = null; score = 0; render(); };
  }
  function render() {
    const q = questions[index];
    body.innerHTML = '<p class="kicker">Question ' + (index + 1) + " of " + questions.length + '</p><p class="sub">' + escapeHtml(q.prompt) + "</p>" +
      q.choices.map((choice, i) => '<button type="button" data-choice="' + i + '">' + escapeHtml(choice) + "</button>").join("") +
      '<p class="why"></p><button type="button" class="btn" data-next hidden>Next</button>';
    body.querySelectorAll("[data-choice]").forEach((button) => {
      button.onclick = () => {
        if (picked !== null) return;
        picked = Number(button.dataset.choice);
        if (picked === q.answer) score += 1;
        body.querySelectorAll("[data-choice]").forEach((item) => {
          const n = Number(item.dataset.choice);
          if (n === q.answer) item.classList.add("good");
          if (n === picked && n !== q.answer) item.classList.add("bad");
        });
        body.querySelector(".why").textContent = q.why;
        const next = body.querySelector("[data-next]");
        next.hidden = false;
        next.textContent = index + 1 >= questions.length ? "See the score" : "Next";
      };
    });
    body.querySelector("[data-next]").onclick = () => {
      if (picked === null) return;
      if (index + 1 >= questions.length) {
        memory.scores[slug] = { score, total: questions.length };
        writeStore(SCORES, memory.scores);
        paintScores();
        renderDone();
        return;
      }
      index += 1;
      picked = null;
      render();
    };
  }
  render();
}
function escapeHtml(value) {
  return String(value).replaceAll("&", "&" + "amp;").replaceAll("<", "&" + "lt;").replaceAll(">", "&" + "gt;");
}
function markNav() {
  const id = (location.hash || "#home").slice(1).split("-")[0];
  const map = { home: "home", albums: "albums", album: "albums", characters: "characters", character: "characters", herge: "herge", franchise: "franchise", library: "library", english: "english", lesson: "english" };
  document.querySelectorAll(".nav a").forEach((link) => link.classList.toggle("on", link.dataset.nav === (map[id] || "home")));
}
load();
paintRead();
paintScores();
filterAlbums();
document.getElementById("album-search")?.addEventListener("input", (event) => {
  albumState.q = event.target.value.trim().toLowerCase();
  filterAlbums();
});
bindChips("era-chips", "era", "era");
bindChips("theme-chips", "theme", "theme");
bindBookChips("kind-chips", "kind", "kind");
bindBookChips("audience-chips", "audience", "audience");
document.querySelectorAll(".quiz").forEach(mountQuiz);
window.addEventListener("hashchange", markNav);
markNav();
if (!storeOk) {
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "This browser will not save marks for a file opened from a folder. The pages still work.";
  document.querySelector("#home .prose")?.append(note);
}

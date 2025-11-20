// frontend/public/app.js
const BASE_URL = window.__BASE_URL__ || location.origin;

const state = {
  loading: false,
  sort: { field: "created_at", dir: "desc" },
  filter: "",
};

function setStatus(msg, type = "ok") {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = msg;
  el.className = `status ${type}`;
}

function isValidUrl(input) {
  try {
    const u = new URL(input);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

function isValidCode(code) {
  if (!code) return true; // optional
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

async function createLink(e) {
  e.preventDefault();
  const url = document.getElementById("url").value.trim();
  const code = document.getElementById("code").value.trim();
  const btn = document.getElementById("createBtn");

  if (!isValidUrl(url)) {
    setStatus("Please enter a valid http(s) URL.", "err");
    return;
  }
  if (!isValidCode(code)) {
    setStatus("Code must match [A-Za-z0-9]{6,8] or leave blank.", "err");
    return;
  }

  setStatus("Creating link...", "ok");
  btn.disabled = true;

  try {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code: code || undefined })
    });

    if (res.status === 409) {
      setStatus("Custom code already exists. Try another.", "err");
    } else if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err.error || "Failed to create.", "err");
    } else {
      const data = await res.json();
      setStatus("Created successfully!", "ok");
      document.getElementById("url").value = "";
      document.getElementById("code").value = "";
      await loadLinks();
    }
  } catch (e) {
    setStatus("Network error. Please try again.", "err");
  } finally {
    btn.disabled = false;
  }
}

async function loadLinks() {
  const tableBody = document.getElementById("tbody");
  const empty = document.getElementById("empty");
  const loading = document.getElementById("loading");

  if (!tableBody) return;
  tableBody.innerHTML = "";
  empty.style.display = "none";
  loading.style.display = "block";

  try {
    const res = await fetch("/api/links");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();

    // Filter
    const filtered = data.filter((l) => {
      const q = state.filter.toLowerCase();
      return (
        !q ||
        l.code.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      const { field, dir } = state.sort;
      const va = a[field] || "";
      const vb = b[field] || "";
      const m = dir === "asc" ? 1 : -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * m;
    });

    if (filtered.length === 0) {
      empty.style.display = "block";
      return;
    }

    for (const l of filtered) {
      const shortUrl = `${BASE_URL.replace(/\/$/, "")}/${l.code}`;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><a href="/code/${l.code}"><strong>${l.code}</strong></a><button class="copy" data-copy="${shortUrl}">Copy</button></td>
        <td class="url-cell" title="${l.url}">${l.url}</td>
        <td>${l.clicks}</td>
        <td>${l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "-"}</td>
        <td>
          <a class="button-secondary" href="/code/${l.code}">View</a>
          <button class="button-danger" data-del="${l.code}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    }

    tableBody.querySelectorAll("button[data-del]").forEach((b) => {
      b.addEventListener("click", async () => {
        const code = b.getAttribute("data-del");
        b.disabled = true;
        try {
          const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
          if (!res.ok) setStatus("Delete failed.", "err");
          else {
            setStatus("Deleted.", "ok");
            await loadLinks();
          }
        } catch {
          setStatus("Network error.", "err");
        } finally {
          b.disabled = false;
        }
      });
    });

    tableBody.querySelectorAll("button[data-copy]").forEach((b) => {
      b.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(b.getAttribute("data-copy"));
          setStatus("Short URL copied!", "ok");
        } catch {
          setStatus("Copy failed.", "err");
        }
      });
    });
  } catch (err) {
    console.error(err);
    setStatus("Failed to load links.", "err");
  } finally {
    loading.style.display = "none";
  }
}

function initDashboard() {
  const createForm = document.getElementById("createForm");
  if (createForm) createForm.addEventListener("submit", createLink);
  const filter = document.getElementById("filter");
  if (filter) {
    filter.addEventListener("input", (e) => {
      state.filter = e.target.value;
      // debounce could be added but OK for small datasets
      loadLinks();
    });
  }
  const sort = document.getElementById("sort");
  if (sort) {
    sort.addEventListener("change", (e) => {
      const [field, dir] = e.target.value.split(":");
      state.sort = { field, dir };
      loadLinks();
    });
  }
  loadLinks();
}

// Stats page logic
async function initStats(code) {
  const container = document.getElementById("stats");
  const status = document.getElementById("status");

  if (!status || !container) return;

  status.textContent = "Loading stats...";
  status.className = "status";

  try {
    const res = await fetch(`/api/links/${code}`);
    if (res.status === 404) {
      status.textContent = "Not found.";
      status.className = "status err";
      container.innerHTML = "";
      return;
    }
    if (!res.ok) throw new Error("Failed to fetch");
    const l = await res.json();
    const shortUrl = `${BASE_URL.replace(/\/$/, "")}/${l.code}`;
    container.innerHTML = `
      <div class="panel">
        <h2>Code: <span class="badge">${l.code}</span></h2>
        <p><strong>Target URL:</strong> <span class="url-cell" title="${l.url}">${l.url}</span>
           <button class="copy" data-copy="${l.url}">Copy target</button></p>
        <p><strong>Short URL:</strong> <a href="/${l.code}">${shortUrl}</a>
           <button class="copy" data-copy="${shortUrl}">Copy short</button></p>
        <p><strong>Total clicks:</strong> ${l.clicks}</p>
        <p><strong>Last clicked:</strong> ${l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "-"}</p>
        <div style="margin-top:12px;">
          <a class="button-secondary" href="/">Back</a>
          <button class="button-danger" id="del">Delete</button>
        </div>
      </div>
    `;
    document.querySelectorAll("button.copy").forEach((b) => {
      b.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(b.getAttribute("data-copy"));
          setStatus("Copied to clipboard.", "ok");
        } catch {
          setStatus("Copy failed.", "err");
        }
      });
    });
    document.getElementById("del").addEventListener("click", async () => {
      try {
        const r = await fetch(`/api/links/${l.code}`, { method: "DELETE" });
        if (r.ok) {
          setStatus("Deleted. Redirects now 404.", "ok");
          setTimeout(() => (window.location.href = "/"), 800);
        } else {
          setStatus("Delete failed.", "err");
        }
      } catch {
        setStatus("Network error.", "err");
      }
    });
    status.textContent = "Loaded.";
    status.className = "status ok";
  } catch (err) {
    console.error(err);
    status.textContent = "Failed to load stats.";
    status.className = "status err";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "dashboard") initDashboard();
  if (page === "stats") {
    const code = document.body.getAttribute("data-code");
    initStats(code);
  }
});

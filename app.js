const SERVER_URL = "https://chat-room-aadn.onrender.com"; // <-- change me

const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

const connStatus = document.getElementById("connStatus");
const messagesEl = document.getElementById("messages");

const composer = document.getElementById("composer");
const nameInput = document.getElementById("nameInput");
const msgInput = document.getElementById("msgInput");

// Keep a local copy of "my name" for UI alignment
let myName = "";

function setStatus(text, kind = "info") {
  connStatus.textContent = text;
  connStatus.style.borderColor =
    kind === "ok" ? "rgba(110,168,254,0.65)" :
    kind === "warn" ? "rgba(255, 210, 91, 0.65)" :
    kind === "bad" ? "rgba(255,107,107,0.65)" :
    "var(--border)";
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMessage(m) {
  // m: { id, name, text, ts }
  const bubble = document.createElement("div");
  const isMe = m.name === myName && myName !== "";

  bubble.className = "bubble" + (isMe ? " me" : "");
  bubble.innerHTML = `
    <div class="meta">
      <span class="name">${escapeHtml(m.name)}</span>
      <span>${new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
    <div class="text">${escapeHtml(m.text)}</div>
  `;

  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Connection events
socket.on("connect", () => setStatus("Connected", "ok"));
socket.on("disconnect", () => setStatus("Disconnected", "bad"));

socket.on("chat:message", (m) => {
  renderMessage(m);
});

socket.on("chat:history", (arr) => {
  messagesEl.innerHTML = "";
  arr.forEach(renderMessage);
});

// Send message
composer.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const text = msgInput.value.trim();

  if (!name || !text) return;

  myName = name;

  socket.emit("chat:send", { name, text });
  msgInput.value = "";
  msgInput.focus();
});

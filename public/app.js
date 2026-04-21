const socket = io();

const state = {
  currentUser: null,
  targetUserId: null,
  roomId: null,
};

const registerForm = document.querySelector("#register-form");
const sessionBox = document.querySelector("#session-box");
const currentUserLabel = document.querySelector("#current-user");
const currentUserIdLabel = document.querySelector("#current-user-id");
const targetUserSelect = document.querySelector("#target-user");
const messagesBox = document.querySelector("#messages");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");

function appendMessage(message, mode) {
  const item = document.createElement("article");
  item.className = `message ${mode}`;
  item.innerHTML = `
    <header>#${message.id} - ${new Date(message.createdAt).toLocaleString()}</header>
    <p>${message.content}</p>
  `;
  messagesBox.appendChild(item);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error ?? "REQUEST_FAILED");
  }

  return response.json();
}

async function refreshUsers() {
  const users = await fetchJson("/api/users");
  const availableUsers = users.filter((user) => user.id !== state.currentUser.id);

  targetUserSelect.innerHTML = "";
  availableUsers.forEach((user) => {
    const option = document.createElement("option");
    option.value = String(user.id);
    option.textContent = `${user.username} (#${user.id})`;
    targetUserSelect.appendChild(option);
  });

  if (availableUsers.length > 0) {
    state.targetUserId = Number(availableUsers[0].id);
    await openRoom();
  }
}

async function openRoom() {
  if (!state.currentUser || !state.targetUserId) {
    return;
  }

  const room = await fetchJson("/api/rooms", {
    method: "POST",
    body: JSON.stringify({
      currentUserId: state.currentUser.id,
      targetUserId: state.targetUserId,
    }),
  });

  state.roomId = room.id;
  const messages = await fetchJson(
    `/api/rooms/${state.roomId}/messages?userId=${state.currentUser.id}`,
  );

  messagesBox.innerHTML = "";
  messages.forEach((message) => {
    appendMessage(
      message,
      message.senderId === state.currentUser.id ? "outgoing" : "incoming",
    );
  });
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const username = formData.get("username");

  state.currentUser = await fetchJson("/api/users/register", {
    method: "POST",
    body: JSON.stringify({ username }),
  });

  currentUserLabel.textContent = state.currentUser.username;
  currentUserIdLabel.textContent = String(state.currentUser.id);
  sessionBox.classList.remove("hidden");

  await refreshUsers();

  socket.emit("session:register", { userId: state.currentUser.id });
});

targetUserSelect.addEventListener("change", async (event) => {
  state.targetUserId = Number(event.target.value);
  await openRoom();
});

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.currentUser || !state.targetUserId || !messageInput.value.trim()) {
    return;
  }

  socket.emit("message:send", {
    senderId: state.currentUser.id,
    recipientId: state.targetUserId,
    content: messageInput.value,
  });

  messageInput.value = "";
});

socket.on("message:sent", async ({ room, message }) => {
  if (state.currentUser?.id !== message.senderId) {
    return;
  }

  if (state.targetUserId !== message.recipientId) {
    return;
  }

  state.roomId = room.id;
  appendMessage(message, "outgoing");
});

socket.on("message:received", async (message) => {
  if (!state.currentUser || message.recipientId !== state.currentUser.id) {
    return;
  }

  socket.emit("message:delivered", { messageId: message.id });

  if (state.targetUserId !== message.senderId) {
    return;
  }

  appendMessage(message, "incoming");
  socket.emit("message:read", { messageId: message.id });
});

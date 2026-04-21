export class PresenceManager {
  constructor() {
    this.userSockets = new Map();
  }

  connect(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId).add(socketId);
  }

  disconnect(userId, socketId) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) {
      return;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  isOnline(userId) {
    return this.userSockets.has(userId);
  }

  getSockets(userId) {
    return this.userSockets.get(userId) ?? new Set();
  }
}

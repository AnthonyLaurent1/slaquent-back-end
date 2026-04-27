export class PresenceManager {
  /**
   * Create the in-memory presence registry.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @returns {void} Nothing.
   */
  constructor() {
    this.userSockets = new Map();
  }

  /**
   * Register a socket for a user.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @param {string} socketId - Socket identifier.
   * @returns {void} Nothing.
   */
  connect(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId).add(socketId);
  }

  /**
   * Remove a socket from a user.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @param {string} socketId - Socket identifier.
   * @returns {void} Nothing.
   */
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

  /**
   * Check whether a user is online.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @returns {boolean} True when the user has at least one active socket.
   */
  isOnline(userId) {
    return this.userSockets.has(userId);
  }

  /**
   * Get all sockets for a user.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @returns {Set<string>} Active socket identifiers.
   */
  getSockets(userId) {
    return this.userSockets.get(userId) ?? new Set();
  }
}

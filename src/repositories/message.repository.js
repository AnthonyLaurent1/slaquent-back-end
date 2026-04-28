import { prisma } from "../config/prisma.js";

export class MessageRepository {

  async findById(id) {
    return prisma.message.findUnique({
      where: { id },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  /**
   * Create a message with sender and recipient relations.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {object} data - Message payload.
   * @returns {Promise<object>} Created message.
   */
  async create(data) {
    return prisma.message.create({
      data,
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  /**
   * List messages for a room.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} roomId - Room identifier.
   * @param {number} limit - Maximum number of rows.
   * @returns {Promise<object[]>} Messages ordered by creation date.
   */
  async listByRoom(roomId, limit = 50) {
    return prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  /**
   * List pending messages for a recipient.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} recipientId - Recipient identifier.
   * @returns {Promise<object[]>} Undelivered messages.
   */
  async listPendingForRecipient(recipientId) {
    return prisma.message.findMany({
      where: {
        recipientId,
        deliveredAt: null,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  /**
   * Mark unread messages in a room as read.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} roomId - Room identifier.
   * @param {number} recipientId - Recipient identifier.
   * @returns {Promise<object>} Update result.
   */
  async markRoomMessagesRead(roomId, recipientId) {
    return prisma.message.updateMany({
      where: {
        roomId,
        recipientId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark a message as delivered.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} messageId - Message identifier.
   * @returns {Promise<object>} Updated message.
   */
  async markDelivered(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: {
        deliveredAt: new Date(),
      },
    });
  }

  /**
   * Mark a message as read.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} messageId - Message identifier.
   * @returns {Promise<object>} Updated message.
   */
  async markRead(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: {
        readAt: new Date(),
      },
    });
  }
}

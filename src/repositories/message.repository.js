import { prisma } from "../config/prisma.js";

export class MessageRepository {
  async create(data) {
    return prisma.message.create({
      data,
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

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

  async markDelivered(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: {
        deliveredAt: new Date(),
      },
    });
  }

  async markRead(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: {
        readAt: new Date(),
      },
    });
  }
}

import { prisma } from "../config/prisma.js";

export class RoomRepository {
  async findById(id) {
    return prisma.directRoom.findUnique({
      where: { id },
      include: {
        userA: true,
        userB: true,
      },
    });
  }

  async findByParticipants(userAId, userBId) {
    return prisma.directRoom.findUnique({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      include: {
        userA: true,
        userB: true,
      },
    });
  }

  async create(userAId, userBId) {
    return prisma.directRoom.create({
      data: {
        userAId,
        userBId,
      },
      include: {
        userA: true,
        userB: true,
      },
    });
  }

  async listForUser(userId) {
    return prisma.directRoom.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async touch(roomId, lastMessageId) {
    return prisma.directRoom.update({
      where: { id: roomId },
      data: {
        updatedAt: new Date(),
        lastMessageId,
      },
    });
  }
}

import { prisma } from "../config/prisma.js";

export class RoomRepository {
  /**
   * Find a direct room by identifier.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} id - Room identifier.
   * @returns {Promise<object|null>} Room or null.
   */
  async findById(id) {
    return prisma.directRoom.findUnique({
      where: { id },
      include: {
        userA: true,
        userB: true,
      },
    });
  }

  /**
   * Find a direct room by participant pair.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userAId - First participant identifier.
   * @param {number} userBId - Second participant identifier.
   * @returns {Promise<object|null>} Room or null.
   */
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

  /**
   * Create a direct room.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userAId - First participant identifier.
   * @param {number} userBId - Second participant identifier.
   * @returns {Promise<object>} Created room.
   */
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

  /**
   * List rooms for a user.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @returns {Promise<object[]>} Matching rooms.
   */
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

  /**
   * Update room metadata after a new message.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} roomId - Room identifier.
   * @param {number} lastMessageId - Last message identifier.
   * @returns {Promise<object>} Updated room.
   */
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

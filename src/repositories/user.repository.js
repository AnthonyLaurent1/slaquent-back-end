import { prisma } from "../config/prisma.js";

export class UserRepository {
  /**
   * Create a user.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {string} username - Username to create.
   * @returns {Promise<object>} Created user.
   */
  async create(username) {
    return prisma.user.create({
      data: { username },
    });
  }

  /**
   * Find a user by identifier.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} id - User identifier.
   * @returns {Promise<object|null>} User or null.
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by username.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {string} username - Username.
   * @returns {Promise<object|null>} User or null.
   */
  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * List all users.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @returns {Promise<object[]>} Users ordered by username.
   */
  async list() {
    return prisma.user.findMany({
      orderBy: { username: "asc" },
    });
  }
}

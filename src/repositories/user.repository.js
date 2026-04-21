import { prisma } from "../config/prisma.js";

export class UserRepository {
  async create(username) {
    return prisma.user.create({
      data: { username },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async list() {
    return prisma.user.findMany({
      orderBy: { username: "asc" },
    });
  }
}

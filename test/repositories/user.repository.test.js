import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "../../src/repositories/user.repository.js";
import { prisma } from "../../src/config/prisma.js";

describe("UserRepository", () => {
  beforeEach(() => {
    prisma.user = {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    };
  });

  it("creates a user", async () => {
    prisma.user.create.mockResolvedValue({ id: 1, username: "alice" });
    const repo = new UserRepository();
    const res = await repo.create("alice");
    expect(prisma.user.create).toHaveBeenCalledWith({ data: { username: "alice" } });
    expect(res).toEqual({ id: 1, username: "alice" });
  });

  it("finds by id", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, username: "bob" });
    const repo = new UserRepository();
    const res = await repo.findById(2);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(res).toEqual({ id: 2, username: "bob" });
  });

  it("finds by username", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 3, username: "carol" });
    const repo = new UserRepository();
    const res = await repo.findByUsername("carol");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: "carol" } });
    expect(res).toEqual({ id: 3, username: "carol" });
  });

  it("lists users ordered by username", async () => {
    const users = [{ id: 1, username: "a" }, { id: 2, username: "b" }];
    prisma.user.findMany.mockResolvedValue(users);
    const repo = new UserRepository();
    const res = await repo.list();
    expect(prisma.user.findMany).toHaveBeenCalledWith({ orderBy: { username: "asc" } });
    expect(res).toEqual(users);
  });
});

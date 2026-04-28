import { describe, it, expect, beforeEach, vi } from "vitest";
import { MessageRepository } from "../../src/repositories/message.repository.js";
import { prisma } from "../../src/config/prisma.js";

describe("MessageRepository", () => {
  beforeEach(() => {
    prisma.message = {
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    };
  });

  it("creates a message including relations", async () => {
    const payload = { roomId: 1, senderId: 2, recipientId: 3, content: "hi" };
    prisma.message.create.mockResolvedValue({ id: 10, ...payload });
    const repo = new MessageRepository();
    const res = await repo.create(payload);
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: payload,
      include: { sender: true, recipient: true },
    });
    expect(res).toEqual({ id: 10, ...payload });
  });

  it("lists messages by room with limit", async () => {
    const messages = [{ id: 1 }, { id: 2 }];
    prisma.message.findMany.mockResolvedValue(messages);
    const repo = new MessageRepository();
    const res = await repo.listByRoom(5, 2);
    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { roomId: 5 },
      orderBy: { createdAt: "asc" },
      take: 2,
      include: { sender: true, recipient: true },
    });
    expect(res).toEqual(messages);
  });

  it("lists pending messages for recipient", async () => {
    const pending = [{ id: 3 }];
    prisma.message.findMany.mockResolvedValue(pending);
    const repo = new MessageRepository();
    const res = await repo.listPendingForRecipient(7);
    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { recipientId: 7, deliveredAt: null },
      orderBy: { createdAt: "asc" },
      include: { sender: true, recipient: true },
    });
    expect(res).toEqual(pending);
  });

  it("marks room messages read", async () => {
    prisma.message.updateMany.mockResolvedValue({ count: 2 });
    const repo = new MessageRepository();
    const res = await repo.markRoomMessagesRead(1, 2);
    expect(prisma.message.updateMany).toHaveBeenCalled();
    expect(res).toEqual({ count: 2 });
  });

  it("marks message delivered and read", async () => {
    prisma.message.update.mockResolvedValue({ id: 4 });
    const repo = new MessageRepository();
    const res1 = await repo.markDelivered(4);
    expect(prisma.message.update).toHaveBeenCalledWith({ where: { id: 4 }, data: { deliveredAt: expect.any(Date) } });
    expect(res1).toEqual({ id: 4 });

    const res2 = await repo.markRead(5);
    expect(prisma.message.update).toHaveBeenCalledWith({ where: { id: 5 }, data: { readAt: expect.any(Date) } });
    expect(res2).toEqual({ id: 4 });
  });
});

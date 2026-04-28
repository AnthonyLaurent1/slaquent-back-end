import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ChatService } from "../../src/services/chat.service.js";
import * as cache from "../../src/cache/cache.service.js";
import { feedService } from "../../src/services/feed.service.js";

describe("ChatService", () => {
  let service;

  beforeEach(() => {
    service = new ChatService();
    // replace repositories with mocks
    service.users = {
      findByUsername: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
    };
    service.rooms = {
      findByParticipants: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      listForUser: vi.fn(),
      touch: vi.fn(),
    };
    service.messages = {
      create: vi.fn(),
      listByRoom: vi.fn(),
      markRoomMessagesRead: vi.fn(),
      listPendingForRecipient: vi.fn(),
      markDelivered: vi.fn(),
      markRead: vi.fn(),
    };

    // mock cache and feed functions using spies (ESM module namespace is read-only)
    vi.spyOn(cache, "get").mockResolvedValue(null);
    vi.spyOn(cache, "set").mockResolvedValue();
    vi.spyOn(cache, "lpushTrim").mockResolvedValue();
    vi.spyOn(cache, "del").mockResolvedValue();
    vi.spyOn(cache, "publish").mockResolvedValue();
    vi.spyOn(feedService, "markPublicWithChance").mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registerUser rejects empty username", async () => {
    await expect(service.registerUser("   ")).rejects.toThrow("USERNAME_REQUIRED");
  });

  it("registerUser returns existing user when found", async () => {
    service.users.findByUsername.mockResolvedValue({ id: 1, username: "bob" });
    const res = await service.registerUser("bob");
    expect(res).toEqual({ id: 1, username: "bob" });
    expect(service.users.create).not.toHaveBeenCalled();
  });

  it("getOrCreateDirectRoom forbids self chat", async () => {
    await expect(service.getOrCreateDirectRoom(1, 1)).rejects.toThrow("SELF_CHAT_FORBIDDEN");
  });

  it("listMessages returns cached serialized messages", async () => {
    const roomId = 10;
    const userId = 20;
    service.users.findById.mockResolvedValue({ id: userId });
    service.rooms.findById.mockResolvedValue({ id: roomId, userAId: userId, userBId: 99 });
    service.messages.markRoomMessagesRead.mockResolvedValue();
    cache.get.mockResolvedValue([{ id: 5, content: "cached", readAt: null }]);

    const res = await service.listMessages(roomId, userId, 50);
    expect(service.messages.markRoomMessagesRead).toHaveBeenCalledWith(roomId, userId);
    expect(res).toEqual([{ id: 5, content: "cached", readAt: null, isRead: false }]);
  });

  it("createMessage creates, touches room and publishes", async () => {
    const senderId = 2;
    const recipientId = 3;
    const room = { id: 77 };
    const message = { id: 123, roomId: 77, senderId, recipientId, content: "hi", readAt: null };

    service.getOrCreateDirectRoom = vi.fn().mockResolvedValue(room);
    service.messages.create.mockResolvedValue(message);
    service.rooms.touch.mockResolvedValue({});
    feedService.markPublicWithChance.mockResolvedValue(null);

    const res = await service.createMessage(senderId, recipientId, " hi ");

    expect(service.getOrCreateDirectRoom).toHaveBeenCalledWith(senderId, recipientId);
    expect(service.messages.create).toHaveBeenCalled();
    expect(service.rooms.touch).toHaveBeenCalledWith(room.id, message.id);
    expect(feedService.markPublicWithChance).toHaveBeenCalledWith(message.id);
    expect(cache.lpushTrim).toHaveBeenCalled();
    expect(cache.publish).toHaveBeenCalled();
    expect(res.room).toEqual(room);
    expect(res.message).toEqual({ ...message, isRead: false });
  });
});

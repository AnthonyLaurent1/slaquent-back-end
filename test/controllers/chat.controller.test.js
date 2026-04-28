import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { chatService } from "../../src/controllers/chat.controller.js";
import { createServer } from "../../src/server.js";

describe("ChatController routes", () => {
  beforeEach(() => {
    chatService.registerUser = vi.fn();
  });

  it("POST /api/users/register -> 201 on success", async () => {
    chatService.registerUser.mockResolvedValue({ id: 1, username: "alice" });
    const { app } = createServer();
    const res = await request(app).post("/api/users/register").send({ username: "alice" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, username: "alice" });
  });

  it("POST /api/users/register -> 400 on missing username", async () => {
    chatService.registerUser.mockRejectedValue(new Error("USERNAME_REQUIRED"));
    const { app } = createServer();
    const res = await request(app).post("/api/users/register").send({ username: "" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "USERNAME_REQUIRED" });
  });

  it("GET /health -> ok", async () => {
    const { app } = createServer();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

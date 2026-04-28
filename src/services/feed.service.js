import { FeedRepository } from "../repositories/feed.repositoy.js";
import { generateText } from "./ai/ai.service.js";
import { MessageRepository } from "../repositories/message.repository.js";
import * as cache from "../cache/cache.service.js";

export class FeedService {
  constructor() {
    this.feedRepository = new FeedRepository();
    this.messages = new MessageRepository();
    this.randomValue = Math.floor(Math.random() * 41) + 10;
  }

  /**
   * With the random value given, mark message public with x% of chance, where x is the random value.
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} messageId - Message identifier.
   * @returns {Promise<object|null>} Updated message if marked public, otherwise null.
   */
  async markPublicWithChance(messageId) {
    if (!Number.isInteger(messageId)) {
      throw new TypeError("MESSAGE_NOT_FOUND");
    }

    const content = await this.getMessageContent(messageId);
    if (!content) {
      return null;
    }

    // First, use the AI to check relevance. If AI says 'oui', mark public and publish.
    try {
      const relevant = await this.checkRevelance(content);
      if (relevant) {
        const updated = await this.feedRepository.markAsPublic(messageId);
        try {
          await cache.publish("feed:public", { type: "feed:public:new", payload: updated });
        } catch (e) {
          process.stderr.write(`feed publish error ${e?.message || e}\n`);
        }
        return updated;
      }
    } catch (e) {
      process.stderr.write(`feed analysis error ${e?.message || e}\n`);
    }

    // Fallback: keep the original randomized promotion behavior.
    const randomChance = Math.random() * 100;
    if (randomChance < this.randomValue) {
      const updated = await this.feedRepository.markAsPublic(messageId);
      try {
        await cache.publish("feed:public", { type: "feed:public:new", payload: updated });
      } catch (e) {
        process.stderr.write(`feed publish error ${e?.message || e}\n`);
      }
      return updated;
    }
    return null;
  }

  /**
   * List all public messages, ordered by creation date.
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @returns {Promise<object[]>} List of public messages with sender details
   */
  async listPublicMessages() {
    return this.feedRepository.listPublicMessages();
  }

  async getMessageContent(messageId) {
    if (!Number.isInteger(messageId)) {
      throw new TypeError("MESSAGE_NOT_FOUND");
    }

    const message = await this.messages.findById(messageId);
    if (!message) {
      throw new Error("MESSAGE_NOT_FOUND");
    }

    return message.content ?? null;
  }

  async checkRevelance(content) {
    try {
      const res = await generateText(content);
      return String(res ?? "").trim().toLowerCase() === "non";
    } catch (e) {
      process.stderr.write(`AI check error ${e?.message || e}\n`);
      return false;
    }
  }
}

export const feedService = new FeedService();

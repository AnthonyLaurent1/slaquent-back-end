import { FeedRepository } from "../repositories/feed.repositoy.js";

export class FeedService {
    constructor() {
        this.feedRepository = new FeedRepository();
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

        const randomChance = Math.random() * 100;
        if (randomChance >= this.randomValue) {
            return null;
        }

        return this.feedRepository.markAsPublic(messageId);
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
}

export const feedService = new FeedService();

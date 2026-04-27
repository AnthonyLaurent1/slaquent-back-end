import { prisma } from "../config/prisma.js";

export class FeedRepository {
    /**
     * Mark a message as public
     * @author Matéo Leroy ( LeroyM084 )
     * @date 2026-04-22
     * @param {number} messageId - Message identifier.
     * @returns {Promise<object>} Updated message with sender and recipient details.
     */
    async markAsPublic(messageId) {
        return prisma.message.update({
            where: { id: messageId },
            data: {
                isPublic: true,
            },
            include: {
                sender: true,
                recipient: true,
            },
        });
    }

    /**
     * List all public messages, ordered by creation date.
     * @author Matéo Leroy ( LeroyM084 )
     * @date 2026-04-22
     * @returns {Promise<object[]>} List of public messages with sender details.
     */
    async listPublicMessages() {
        return prisma.message.findMany({
            where: {
                isPublic: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                sender: true,
            },
        });
    }
}

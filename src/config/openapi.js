export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SLAquent Backend API",
    version: "1.0.0",
    description: "Documentation HTTP du backend de chat SLAquent.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Users" },
    { name: "Rooms" },
    { name: "Messages" },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            example: "USER_NOT_FOUND",
          },
        },
      },
      User: {
        type: "object",
        required: ["id", "username"],
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          username: {
            type: "string",
            example: "alice",
          },
        },
      },
      MessagePreview: {
        type: "object",
        required: [
          "id",
          "roomId",
          "senderId",
          "recipientId",
          "content",
          "createdAt",
        ],
        properties: {
          id: {
            type: "integer",
            example: 123,
          },
          roomId: {
            type: "integer",
            example: 42,
          },
          senderId: {
            type: "integer",
            example: 1,
          },
          recipientId: {
            type: "integer",
            example: 2,
          },
          content: {
            type: "string",
            example: "Salut !",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          deliveredAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          readAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          isRead: {
            type: "boolean",
            example: false,
          },
        },
      },
      Message: {
        allOf: [
          {
            $ref: "#/components/schemas/MessagePreview",
          },
          {
            type: "object",
            properties: {
              sender: {
                $ref: "#/components/schemas/User",
              },
              recipient: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        ],
      },
      PublicMessage: {
        allOf: [
          {
            $ref: "#/components/schemas/MessagePreview",
          },
          {
            type: "object",
            properties: {
              sender: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        ],
      },
      Room: {
        type: "object",
        required: ["id", "userA", "userB"],
        properties: {
          id: {
            type: "integer",
            example: 42,
          },
          userA: {
            $ref: "#/components/schemas/User",
          },
          userB: {
            $ref: "#/components/schemas/User",
          },
          messages: {
            type: "array",
            items: {
              $ref: "#/components/schemas/MessagePreview",
            },
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      RegisterUserRequest: {
        type: "object",
        required: ["username"],
        properties: {
          username: {
            type: "string",
            example: "alice",
          },
        },
      },
      CreateRoomRequest: {
        type: "object",
        required: ["currentUserId", "targetUserId"],
        properties: {
          currentUserId: {
            type: "integer",
            example: 1,
          },
          targetUserId: {
            type: "integer",
            example: 2,
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Healthcheck",
        responses: {
          200: {
            description: "Backend opérationnel",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      example: "ok",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Lister les utilisateurs",
        responses: {
          200: {
            description: "Liste des utilisateurs",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users/register": {
      post: {
        tags: ["Users"],
        summary: "Créer ou récupérer un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterUserRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Utilisateur créé ou existant",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          400: {
            description: "Requête invalide",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/users/{userId}/rooms": {
      get: {
        tags: ["Rooms"],
        summary: "Lister les rooms d'un utilisateur",
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Liste des rooms",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Room",
                  },
                },
              },
            },
          },
          404: {
            description: "Utilisateur introuvable",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/rooms": {
      post: {
        tags: ["Rooms"],
        summary: "Créer ou récupérer une room directe",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateRoomRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Room créée ou existante",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Room",
                },
              },
            },
          },
          400: {
            description: "Requête invalide",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          404: {
            description: "Utilisateur introuvable",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/rooms/{roomId}/messages": {
      get: {
        tags: ["Messages"],
        summary: "Lister les messages d'une room",
        parameters: [
          {
            in: "path",
            name: "roomId",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            in: "query",
            name: "userId",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            in: "query",
            name: "limit",
            required: false,
            schema: {
              type: "integer",
              default: 50,
            },
          },
        ],
        responses: {
          200: {
            description: "Liste des messages",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Message",
                  },
                },
              },
            },
          },
          403: {
            description: "Accès refusé",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          404: {
            description: "Room ou utilisateur introuvable",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/feed": {
      get: {
        tags: ["Messages"],
        summary: "Lister les messages publics",
        responses: {
          200: {
            description: "Liste des messages publics",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/PublicMessage",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

# SLAquent — Documentation backend

Ce document décrit les routes HTTP exposées par le backend et l'usage du WebSocket (Socket.IO) pour l'application de chat. Il est destiné aux équipes frontend et mobile.

Base URL

- Préfixe des routes API : `/api` (le serveur monte `apiRouter` sur `/api`).
- Swagger UI : `/api-docs` (ex: `http://localhost:3000/api-docs`).
- Le WebSocket utilise Socket.IO sur la même origine que le serveur HTTP (ex: `https://api.example.com` ou `http://localhost:3000`).

Format d'erreur

- Les réponses HTTP en erreur retournent un objet JSON :

  { "error": "ERROR_CODE" }

- Les callbacks Socket.IO retournent généralement :

  { "ok": true, ... } ou { "ok": false, "error": "ERROR_CODE" }

## Routes HTTP

Toutes les routes sont préfixées par `/api`.

1. GET /api/users

- Description : lister tous les utilisateurs.
- Requête : aucune.
- Réponse (200) : tableau d'utilisateurs.

Exemple de user :

{
"id": 1,
"username": "alice"
}

2. POST /api/users/register

- Description : créer ou récupérer un utilisateur par `username`.
- Requête : `Content-Type: application/json` avec le corps :

  { "username": "alice" }

- Réponse (201) : objet `user` créé ou existant.
- Erreurs possibles : `USERNAME_REQUIRED`.

3. GET /api/users/:userId/rooms

- Description : lister les rooms (conversations directes) auxquelles l'utilisateur participe.
- Paramètres : `:userId` (entier).
- Réponse (200) : tableau de rooms. Chaque room inclut les participants (`userA`, `userB`) et, potentiellement, le dernier message dans `messages` (liste triée, `take:1`).

Exemple de room :

{
"id": 42,
"userA": { "id": 1, "username": "alice" },
"userB": { "id": 2, "username": "bob" },
"messages": [ /* dernier message */ ],
"updatedAt": "2026-04-21T..."
}

4. POST /api/rooms

- Description : obtenir ou créer une room directe entre deux utilisateurs.
- Requête : `Content-Type: application/json` avec le corps :

  {
  "currentUserId": 1,
  "targetUserId": 2
  }

- Réponse (200) : objet `room` (voir structure ci-dessus).
- Erreurs possibles : `USER_NOT_FOUND`, `SELF_CHAT_FORBIDDEN`.

5. GET /api/rooms/:roomId/messages

- Description : lister les messages d'une room.
- Effet de bord : si `userId` est le destinataire de messages non lus de la room, le backend renseigne `readAt` au moment de cet appel. Ce comportement ne s'applique pas à `GET /api/users/:userId/rooms` utilisé pour les aperçus de l'accueil.
- Paramètres : `:roomId` (entier).
- Query params :
  - `userId` (entier) — l'utilisateur qui demande (vérification d'accès)
  - `limit` (entier, optionnel) — max de messages (défaut 50)
- Réponse (200) : tableau de messages (ordre ascendant par `createdAt`).

Exemple de message :

{
"id": 123,
"roomId": 42,
"senderId": 1,
"recipientId": 2,
"content": "Salut !",
"createdAt": "2026-04-21T...",
"deliveredAt": null,
"readAt": null,
"isRead": false,
"sender": { "id": 1, "username": "alice" },
"recipient": { "id": 2, "username": "bob" }
}

6. GET /api/feed

- Description : lister les messages publics.
- Réponse (200) : tableau de messages publics triés par `createdAt` décroissant.
- Structure d'un message public : identique à un message, avec `sender` inclus et `recipient` omis.

## WebSocket (Socket.IO)

Le backend expose un gateway Socket.IO (`registerChatGateway(io)`). Les événements utilisables côté client :

Connexion

- URL : `io(<server-url>)` (ex: `io('https://api.example.com')`). Aucune authentification complexe : la session est identifiée par `userId` envoyé via `session:register`.

1. Événement client -> serveur : `session:register`

- Payload : `{ userId: number }`
- Callback réponse :
  - succès : `{ ok: true, pendingMessages: <number> }` et le serveur envoie en plus les `message:received` pour les messages en attente.
  - échec : `{ ok: false, error: "ERROR_CODE" }`

Comportement serveur :

- Vérifie que `userId` existe (`chatService.requireUser`).
- Enregistre `socket.data.userId`, ajoute le socket à la room personnelle `user:<userId>`.
- Récupère et émet les messages en attente via `message:received`.
- Émet `presence:updated` globalement pour informer les autres clients.

2. Événement client -> serveur : `message:send`

- Payload :

  {
  "senderId": 1,
  "recipientId": 2,
  "content": "Bonjour"
  }

- Callback réponse :
  - succès : `{ ok: true, roomId: <id>, messageId: <id> }`
  - échec : `{ ok: false, error: "ERROR_CODE" }`

Comportement serveur :

- Vérifie que `socket.data.userId === senderId` (sinon `ROOM_ACCESS_DENIED`).
- Crée le message et la room si nécessaire, met à jour la room.
- Émet sur la room personnelle de l'expéditeur `user:<senderId>` l'événement `message:sent` (contenant `room` et `message`).
- Émet sur la room personnelle du destinataire `user:<recipientId>` l'événement `message:received` (contenant le `message`).

3. Événements de mise à jour de statut message

- `message:delivered` (client -> serveur) : payload `{ messageId }`. Le serveur marque `deliveredAt`.
- `message:read` (client -> serveur) : payload `{ messageId }`. Le serveur marque `readAt`.

4. Événements presence

- Le serveur émet globalement `presence:updated` avec :

  { "userId": number, "online": boolean }

  Cela permet aux clients d'afficher l'état en ligne/hors-ligne d'un utilisateur.

Exemples rapides (client JS avec Socket.IO client)

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// S'enregistrer
socket.emit("session:register", { userId: 1 }, (res) => {
  if (!res.ok) console.error("session failed", res.error);
  else console.log("pending messages:", res.pendingMessages);
});

// Écouter les messages entrants
socket.on("message:received", (message) => {
  console.log("received", message);
});

// Envoyer un message
socket.emit(
  "message:send",
  {
    senderId: 1,
    recipientId: 2,
    content: "Salut",
  },
  (res) => {
    if (!res.ok) console.error(res.error);
    else console.log("sent: roomId", res.roomId, "messageId", res.messageId);
  },
);

// Signaler lecture / livraison
socket.emit("message:delivered", { messageId: 123 });
socket.emit("message:read", { messageId: 123 });

// Écouter présence
socket.on("presence:updated", ({ userId, online }) => {
  console.log("presence", userId, online);
});
```

## Bonnes pratiques et remarques

- Le backend s'appuie uniquement sur `userId` pour identifier la session Socket.IO. Il faut donc s'assurer côté client qu'on n'usurpe pas d'identité (par ex. via un handshake/auth additionnel si besoin).
- Les callbacks socket fournissent toujours un retour `{ ok: boolean }` — utile pour gérer erreurs côté client.
- Pour optimiser : écouter `presence:updated` et maintenir un état local d'occupancy.
- Les champs retournés suivent le schéma Prisma utilisé par les repositories : `user` (`id`, `username`), `directRoom` (participants, `messages`), `message` (sender/recipient inclus, `createdAt`, `deliveredAt`, `readAt`).

Contact

- Pour toute question sur cette API, contacter l'équipe backend.

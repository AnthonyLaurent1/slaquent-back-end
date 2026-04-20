-- CreateTable
CREATE TABLE "room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" INTEGER NOT NULL,
    "users_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "message_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

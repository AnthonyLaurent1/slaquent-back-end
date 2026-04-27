CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR2(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "direct_room" (
    "id" SERIAL NOT NULL,
    "user_a_id" INTEGER NOT NULL,
    "user_b_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_id" INTEGER,

    CONSTRAINT "direct_room_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "direct_room_user_a_id_user_b_id_key" ON "direct_room"("user_a_id", "user_b_id");
CREATE INDEX "direct_room_user_a_id_idx" ON "direct_room"("user_a_id");
CREATE INDEX "direct_room_user_b_id_idx" ON "direct_room"("user_b_id");
CREATE INDEX "message_room_id_created_at_idx" ON "message"("room_id", "created_at");
CREATE INDEX "message_recipient_id_delivered_at_idx" ON "message"("recipient_id", "delivered_at");
CREATE INDEX "message_recipient_id_read_at_idx" ON "message"("recipient_id", "read_at");

ALTER TABLE "direct_room"
ADD CONSTRAINT "direct_room_user_a_id_fkey"
FOREIGN KEY ("user_a_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "direct_room"
ADD CONSTRAINT "direct_room_user_b_id_fkey"
FOREIGN KEY ("user_b_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "message"
ADD CONSTRAINT "message_room_id_fkey"
FOREIGN KEY ("room_id") REFERENCES "direct_room"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "message"
ADD CONSTRAINT "message_sender_id_fkey"
FOREIGN KEY ("sender_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "message"
ADD CONSTRAINT "message_recipient_id_fkey"
FOREIGN KEY ("recipient_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

/* global process */
import redis from './upstash.client.js';

const DEFAULT_TTL = Number(process.env.CACHE_DEFAULT_TTL || 300);

export async function get(key) {
  const v = await redis.get(key);
  return v ? JSON.parse(v) : null;
}

export async function set(key, value, ttl = DEFAULT_TTL) {
  const s = JSON.stringify(value);
  if (ttl > 0) {
    await redis.set(key, s, { ex: ttl });
  } else {
    await redis.set(key, s);
  }
}

export async function del(key) {
  await redis.del(key);
}

export async function lpushTrim(key, item, maxLen = Number(process.env.RECENT_MESSAGES_MAX || 100)) {
  await redis.lpush(key, JSON.stringify(item));
  await redis.ltrim(key, 0, maxLen - 1);
}

export async function lrange(key, start = 0, end = -1) {
  const arr = await redis.lrange(key, start, end);
  return arr.map((a) => JSON.parse(a));
}

export async function publish(channel, message) {
  await redis.publish(channel, JSON.stringify(message));
}

export const client = redis;

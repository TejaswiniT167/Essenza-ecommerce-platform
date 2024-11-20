import Redis from "ioredis"
import dotenv from 'dotenv'; //since this is a standalone file not called from server.js where we imported dotenv

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

//redis is a key-value store, a giant json
//it has different datastructures like lists, hashes, sets, sortedsets, etc.,
//we are mainly using strings and sets.


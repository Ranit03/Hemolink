import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 60000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (error) => {
      logger.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Disconnected');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
  }
};

// Cache utility functions
export const cacheService = {
  async get(key: string): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await redisClient.setEx(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async setHash(key: string, field: string, value: string): Promise<boolean> {
    try {
      await redisClient.hSet(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', error);
      return false;
    }
  },

  async getHash(key: string, field: string): Promise<string | undefined> {
    try {
      return await redisClient.hGet(key, field);
    } catch (error) {
      logger.error('Redis HGET error:', error);
      return undefined;
    }
  },

  async getAllHash(key: string): Promise<Record<string, string> | null> {
    try {
      return await redisClient.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL error:', error);
      return null;
    }
  },

  async addToSet(key: string, value: string): Promise<boolean> {
    try {
      await redisClient.sAdd(key, value);
      return true;
    } catch (error) {
      logger.error('Redis SADD error:', error);
      return false;
    }
  },

  async removeFromSet(key: string, value: string): Promise<boolean> {
    try {
      await redisClient.sRem(key, value);
      return true;
    } catch (error) {
      logger.error('Redis SREM error:', error);
      return false;
    }
  },

  async getSetMembers(key: string): Promise<string[]> {
    try {
      return await redisClient.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', error);
      return [];
    }
  },

  async isSetMember(key: string, value: string): Promise<boolean> {
    try {
      return await redisClient.sIsMember(key, value);
    } catch (error) {
      logger.error('Redis SISMEMBER error:', error);
      return false;
    }
  }
};

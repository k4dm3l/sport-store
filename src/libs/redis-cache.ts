import { RedisClientType } from 'redis';

export interface ICache {
  get(key: string): Promise<any | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
};

export const redisCacheFactory = ({
  redisClient,
}: {
  redisClient: RedisClientType;
}):ICache => ({
  get: async (key: string) => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },
  set: async (key, value, ttl?) => {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl
    });
  },
  del: async (key) => {
    await redisClient.del(key);
  },
  flush: async () => {
    await redisClient.flushDb();
  }
});
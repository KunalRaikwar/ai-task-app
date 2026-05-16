import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Connected successfully'));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

export const pushTaskToQueue = async (taskId) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.lPush('task_queue', String(taskId));
    console.log(`Task ${taskId} pushed to Redis queue`);
  } catch (error) {
    console.error(`Error pushing task ${taskId} to Redis:`, error);
    throw error;
  }
};

export default redisClient;

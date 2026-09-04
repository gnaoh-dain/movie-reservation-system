import { createClient } from 'redis';
import { env } from './env';

// ponytail: một client dùng chung; thêm pool/cluster khi thực sự chạm giới hạn.
export const redis = createClient({ url: env.REDIS_URL });

redis.on('error', (err) => console.error('Redis error:', err));

export const connectRedis = () => redis.connect();

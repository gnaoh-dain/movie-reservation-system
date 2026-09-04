import morgan from 'morgan';
import { env } from './env';

export const logger = () => {
  return morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    skip: (req) => env.nodeEnv === 'test' || req.url === '/health',
  });
};

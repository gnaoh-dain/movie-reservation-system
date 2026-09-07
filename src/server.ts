import { Server } from 'http';
import { app } from './app';
import { env } from './configs/env';
import { connectRedis, redis } from './configs/redis';
import { prisma } from './configs/db';

let server: Server;

async function startServer() {
  try {
    await connectRedis();
    server = app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) await new Promise((resolve) => server.close(resolve));

  await Promise.allSettled([redis.quit(), prisma.$disconnect()]);

  console.log('Server closed.');
  process.exit(0);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    shutdown(signal).catch((error) => {
      console.error('Error during shutdown:', error);
      process.exit(1);
    });
  });
}

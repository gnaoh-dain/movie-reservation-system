import { Server } from 'http';
import { app } from './app';
import { env } from './configs/env';
import { connectRedis } from './configs/redis';

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

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

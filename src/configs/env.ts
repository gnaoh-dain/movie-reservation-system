import 'dotenv/config';
import { z } from 'zod';

const csv = (defaults: string) =>
  z
    .string()
    .default(defaults)
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );

const parsed = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    APP_URL: z.url().optional(),
    CORS_ORIGINS: csv('http://localhost:5173'),

    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    REDIS_URL: z.url({ protocol: /^redis$/ }).default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(16, 'must be at least 16 characters'),

    UPLOAD_DIR: z.string().default('uploads/'),
    UPLOAD_MAX_FILE_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .default(10 * 1024 * 1024), // 10MB
    UPLOAD_ALLOWED_FILE_TYPES: csv('image/jpeg,image/png,image/gif'),
  })
  .safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`Invalid environment variables (check your .env):\n${issues}`);
  process.exit(1);
}

const { data } = parsed;

export const env = {
  nodeEnv: data.NODE_ENV,
  port: data.PORT,
  appUrl: (data.APP_URL ?? `http://localhost:${data.PORT}`).replace(/\/+$/, ''),
  corsOrigins: data.CORS_ORIGINS,
  databaseUrl: data.DATABASE_URL,
  redisUrl: data.REDIS_URL,
  jwtSecret: data.JWT_SECRET,
  upload: {
    dir: data.UPLOAD_DIR,
    maxFileSize: data.UPLOAD_MAX_FILE_SIZE,
    allowedFileTypes: data.UPLOAD_ALLOWED_FILE_TYPES,
  },
};

import z from 'zod';
import type { NoUndefined } from './index';

const loginBody = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const registerBody = z
  .object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  });

type LoginBody = NoUndefined<z.infer<typeof loginBody>>;
type RegisterBody = NoUndefined<z.infer<typeof registerBody>>;

export { loginBody, registerBody };
export type { LoginBody, RegisterBody };

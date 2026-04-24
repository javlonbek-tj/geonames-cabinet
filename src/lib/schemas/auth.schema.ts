import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Login kiriting'),
  password: z.string().min(1, 'Parol kiriting'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Eski parol kiritilishi shart'),
  newPassword: z.string().min(8, "Yangi parol kamida 8 ta belgi bo'lishi kerak"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

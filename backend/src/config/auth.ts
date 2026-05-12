import { env } from './env';

export const jwtSecret = env.JWT_SECRET || 'devsecret';
export const adminUsername = env.ADMIN_USERNAME || 'admin';
export const adminPassword = env.ADMIN_PASSWORD || 'admin123';

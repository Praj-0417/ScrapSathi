const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  MongoDB: z.string().min(1, 'MongoDB connection string is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  CLIENT_ORIGINS: z.string().optional(),
  // Email (optional — primary & fallback)
  EMAIL: z.string().email().optional().or(z.literal('')),
  PASSWORD: z.string().optional(),
  PRIMARY_EMAIL: z.string().email().optional().or(z.literal('')),
  PRIMARY_EMAIL_PASSWORD: z.string().optional(),
  FALLBACK_EMAIL: z.string().email().optional().or(z.literal('')),
  FALLBACK_EMAIL_PASSWORD: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  // Cloudinary (optional — warn at runtime if not set)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  OTP_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  // Admin credentials (for seeding/initial setup)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_NAME: z.string().optional(),
  ADMIN_PHONE: z.string().optional(),
}).passthrough();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.errors
    .map((error) => `${error.path.join('.')}: ${error.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${formattedErrors}`);
}

const env = parsedEnv.data;

const defaultClientOrigins = [
  'http://localhost:5173',
  'https://scrap-sathi.vercel.app',
  'https://scrap-sathi-amankum2004s-projects.vercel.app',
  'https://scrap-sathi-git-main-amankum2004s-projects.vercel.app',
];

const allowedOrigins = env.CLIENT_ORIGINS
  ? env.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultClientOrigins;

module.exports = {
  env,
  allowedOrigins,
};

import dotenv from 'dotenv';
dotenv.config();

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && (value === undefined || value === '')) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value!;
}

export const ENV = {
  PORT: getEnvVar('PORT'),
  DB_URL: getEnvVar('DB_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
};
import dotenv from "dotenv";
dotenv.config();

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && (value === undefined || value === "")) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value!;
}

export const ENV = {
  HTTP_PORT: getEnvVar("HTTP_PORT"),
  WS_PORT: getEnvVar("WS_PORT"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
};

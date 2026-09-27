// Reads settings from environment variables, with defaults that work out of the box.
// A local .env file is optional (see .env.example).
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: the defaults below apply.
}

export const env = {
  baseUrl: process.env.BASE_URL || 'https://www.amtrak.com',
  workers: Number(process.env.WORKERS || 2),
  timezone: process.env.TIMEZONE || 'America/New_York',
  browserChannel: process.env.BROWSER_CHANNEL || undefined,
  isCI: Boolean(process.env.CI),
};

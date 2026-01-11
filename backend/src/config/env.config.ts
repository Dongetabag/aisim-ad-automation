/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at startup
 */

interface EnvironmentConfig {
  // Database
  DATABASE_URL?: string;
  DB_PASSWORD?: string;
  REDIS_URL?: string;

  // External APIs
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET?: string;
  GOOGLE_API_KEY: string;
  BRAVE_API_KEY?: string;

  // Application
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  NODE_ENV: string;
  PORT: string;
}

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'GOOGLE_API_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env file or environment configuration.`
    );
  }

  // Validate format of certain variables
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }

  const encryptionKey = process.env.ENCRYPTION_KEY!;
  if (encryptionKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long for security');
  }

  // Validate Stripe key format
  const stripeKey = process.env.STRIPE_SECRET_KEY!;
  if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
    console.warn('⚠️  WARNING: STRIPE_SECRET_KEY format appears invalid');
  }

  // Validate Google API key format
  const googleKey = process.env.GOOGLE_API_KEY!;
  if (googleKey === 'your_google_api_key_here' || googleKey === 'YOUR_API_KEY_HERE') {
    throw new Error('GOOGLE_API_KEY must be set to a valid API key (not placeholder value)');
  }

  // Set defaults for optional variables
  const config: EnvironmentConfig = {
    DATABASE_URL: process.env.DATABASE_URL,
    DB_PASSWORD: process.env.DB_PASSWORD,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!,
    BRAVE_API_KEY: process.env.BRAVE_API_KEY,
    JWT_SECRET: jwtSecret,
    ENCRYPTION_KEY: encryptionKey,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
  };

  // Log configuration status (without exposing secrets)
  console.log('✅ Environment validation passed');
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 Backend URL: ${config.BACKEND_URL}`);
  console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
  console.log(`🔑 Google API Key: configured`);
  console.log(`🔑 Stripe Mode: ${stripeKey.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);

  if (!config.BRAVE_API_KEY) {
    console.warn('⚠️  WARNING: BRAVE_API_KEY not set - lead generation features will be limited');
  }

  if (!config.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️  WARNING: STRIPE_WEBHOOK_SECRET not set - webhook verification disabled');
  }

  return config;
}

/**
 * Get a validated environment configuration
 */
export function getConfig(): EnvironmentConfig {
  return validateEnvironment();
}

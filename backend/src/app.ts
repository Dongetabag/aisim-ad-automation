import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { IntakeController } from './controllers/intake.controller';
import { PaymentController } from './controllers/payment.controller';
import { AdController } from './controllers/ad.controller';
import { pool } from './config/database.config';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize controllers
const intakeController = new IntakeController();
const paymentController = new PaymentController();
const adController = new AdController();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.post('/api/intake/submit', (req, res) => intakeController.submitIntakeForm(req, res));
app.get('/api/intake/packages', (req, res) => intakeController.getPackages(req, res));
app.post('/api/intake/payment-intent', (req, res) => intakeController.createPaymentIntent(req, res));
app.post('/api/intake/generate-ad', (req, res) => intakeController.generateFinalAd(req, res));
app.post('/api/intake/google-leads', (req, res) => intakeController.generateGoogleLeads(req, res));
app.post('/api/intake/ad-inspiration', (req, res) => intakeController.getAdInspiration(req, res));
app.get('/api/intake/validate-google', (req, res) => intakeController.validateGoogleApi(req, res));

app.post('/api/payment/webhook', (req, res) => paymentController.handleWebhook(req, res));
app.get('/api/payment/status/:paymentIntentId', (req, res) => paymentController.getPaymentStatus(req, res));
app.post('/api/payment/customer', (req, res) => paymentController.createCustomer(req, res));
app.post('/api/payment/subscription', (req, res) => paymentController.createSubscription(req, res));
app.get('/api/payment/orders/:customerEmail', (req, res) => paymentController.getCustomerOrders(req, res));
app.get('/api/payment/download/:adId', (req, res) => paymentController.downloadAdPackage(req, res));

app.get('/api/ads/:adId', (req, res) => adController.getAd(req, res));
app.get('/api/ads/:adId/performance', (req, res) => adController.getAdPerformance(req, res));
app.post('/api/ads/:adId/deploy', (req, res) => adController.deployAd(req, res));
app.post('/api/ads/:adId/track/:eventType', (req, res) => adController.trackEvent(req, res));
app.get('/api/ads', (req, res) => adController.listAds(req, res));
app.get('/api/analytics/dashboard', (req, res) => adController.getDashboardAnalytics(req, res));
app.get('/api/analytics/realtime', (req, res) => adController.getRealTimeAnalytics(req, res));

// Serve ad embed endpoint
app.get('/api/embed/:adId', async (req, res) => {
  try {
    const { adId } = req.params;
    
    const result = await pool.query(`
      SELECT html, css, javascript FROM ads WHERE id = $1
    `, [adId]);

    if (result.rows.length === 0) {
      res.status(404).send('Ad not found');
      return;
    }

    const ad = result.rows[0];
    
    const embedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AISim Ad - ${adId}</title>
    <style>${ad.css}</style>
</head>
<body>
    ${ad.html}
    <script>${ad.javascript}</script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(embedHtml);
  } catch (error) {
    console.error('Embed ad error:', error);
    res.status(500).send('Error loading ad');
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(255) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        website VARCHAR(500) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        contact_email VARCHAR(255),
        contact_name VARCHAR(255),
        estimated_size VARCHAR(50),
        source VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        package_id VARCHAR(100) NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        stripe_payment_intent_id VARCHAR(255) UNIQUE,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create ads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id VARCHAR(255) PRIMARY KEY,
        payment_intent_id VARCHAR(255) REFERENCES orders(stripe_payment_intent_id),
        html TEXT NOT NULL,
        css TEXT NOT NULL,
        javascript TEXT NOT NULL,
        preview TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create analytics_events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id VARCHAR(255) PRIMARY KEY,
        ad_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        url VARCHAR(1000),
        referrer VARCHAR(1000),
        user_agent TEXT,
        ip_address INET,
        metadata JSONB
      )
    `);

    // Create payment_failures table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_failures (
        id SERIAL PRIMARY KEY,
        stripe_payment_intent_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
}

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 AISim Ad Automation Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();

export default app;

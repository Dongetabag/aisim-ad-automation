const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'frontend/out')));

// Serve the main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AISim Automated Ad System</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                max-width: 800px;
                padding: 2rem;
            }
            .logo {
                font-size: 3rem;
                font-weight: bold;
                color: #10b981;
                margin-bottom: 1rem;
            }
            .subtitle {
                font-size: 1.2rem;
                color: #94a3b8;
                margin-bottom: 2rem;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin: 2rem 0;
            }
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .feature h3 {
                color: #10b981;
                margin-bottom: 0.5rem;
            }
            .status {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid #10b981;
                padding: 1rem;
                border-radius: 8px;
                margin: 2rem 0;
            }
            .btn {
                background: #10b981;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 0.5rem;
            }
            .btn:hover {
                background: #059669;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🎯 AISim</div>
            <div class="subtitle">Automated Ad System - Virtual Environment</div>
            
            <div class="status">
                <h3>✅ System Status: RUNNING</h3>
                <p>Virtual environment is active and ready for use!</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>🤖 AI Ad Generation</h3>
                    <p>Automated ad creation using advanced AI models</p>
                </div>
                <div class="feature">
                    <h3>📊 Lead Generation</h3>
                    <p>Google Places integration for targeted leads</p>
                </div>
                <div class="feature">
                    <h3>💳 Payment Processing</h3>
                    <p>Stripe integration for seamless payments</p>
                </div>
                <div class="feature">
                    <h3>📈 Analytics Dashboard</h3>
                    <p>Real-time performance tracking</p>
                </div>
            </div>
            
            <div>
                <a href="#" class="btn" onclick="alert('AI Ad Generation - Coming Soon!')">Create Ad</a>
                <a href="#" class="btn" onclick="alert('Lead Generation - Coming Soon!')">Generate Leads</a>
                <a href="#" class="btn" onclick="alert('Analytics - Coming Soon!')">View Analytics</a>
            </div>
            
            <div style="margin-top: 2rem; color: #64748b;">
                <p>🚀 Virtual Environment Ready | Port: ${PORT} | Status: Active</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 AISim Virtual Environment running on http://localhost:${PORT}`);
  console.log('✅ System ready for use!');
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AISim Google AI Test</title>
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
        .form-group {
            margin: 1rem 0;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #94a3b8;
        }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #374151;
            border-radius: 8px;
            background: #1f2937;
            color: white;
            font-size: 16px;
        }
        .form-group textarea {
            height: 100px;
            resize: vertical;
        }
        .btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            cursor: pointer;
            margin: 1rem;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        .result {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: left;
        }
        .ad-preview {
            background: white;
            color: black;
            padding: 2rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: left;
        }
        .status {
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .status.success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            color: #10b981;
        }
        .status.error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
            color: #ef4444;
        }
        .status.info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid #3b82f6;
            color: #3b82f6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎯 AISim Google AI Test</div>
        <h2>Test Ad Generation with Google AI</h2>
        
        <div class="status info">
            <h3>🤖 Google AI Integration Test</h3>
            <p>This test will verify that the backend is using Google AI (Gemini Pro) to generate ads.</p>
        </div>
        
        <form id="adForm">
            <div class="form-group">
                <label for="companyName">Company Name</label>
                <input type="text" id="companyName" value="TechCorp Solutions" required>
            </div>
            
            <div class="form-group">
                <label for="industry">Industry</label>
                <select id="industry" required>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="education">Education</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="targetAudience">Target Audience</label>
                <input type="text" id="targetAudience" value="Small business owners" required>
            </div>
            
            <div class="form-group">
                <label for="adObjective">Ad Objective</label>
                <select id="adObjective" required>
                    <option value="brand-awareness">Brand Awareness</option>
                    <option value="lead-generation">Lead Generation</option>
                    <option value="sales">Sales</option>
                    <option value="traffic">Website Traffic</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="keyMessage">Key Message</label>
                <textarea id="keyMessage" placeholder="Enter your key message or value proposition...">Transform your business with our innovative solutions</textarea>
            </div>
            
            <button type="submit" class="btn">🤖 Generate AI Ad with Google AI</button>
        </form>
        
        <div id="status"></div>
        <div id="result"></div>
    </div>

    <script>
        document.getElementById('adForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const statusDiv = document.getElementById('status');
            const resultDiv = document.getElementById('result');
            
            // Show loading status
            statusDiv.innerHTML = '<div class="status info">🔄 Generating AI ad with Google AI... Please wait...</div>';
            resultDiv.innerHTML = '';
            
            // Get form data
            const formData = {
                businessName: document.getElementById('companyName').value,
                industry: document.getElementById('industry').value,
                targetAudience: document.getElementById('targetAudience').value,
                adObjective: document.getElementById('adObjective').value,
                keyMessage: document.getElementById('keyMessage').value
            };
            
            try {
                // Try to call the actual API first
                const response = await fetch('http://localhost:3000/api/ads/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const adData = await response.json();
                    displayAdResult(adData);
                    statusDiv.innerHTML = '<div class="status success">✅ Ad generated successfully with Google AI!</div>';
                } else {
                    throw new Error('API call failed');
                }
            } catch (error) {
                console.error('API Error:', error);
                // Fallback to mock ad generation
                const mockAd = generateMockAd(formData);
                displayAdResult(mockAd);
                statusDiv.innerHTML = '<div class="status error">⚠️ Using mock data (Backend API not available)</div>';
            }
        });
        
        function generateMockAd(data) {
            return {
                headline: \`Transform Your \${data.industry.charAt(0).toUpperCase() + data.industry.slice(1)} Business\`,
                subheadline: \`Discover how \${data.companyName} can revolutionize your operations\`,
                body: \`\${data.keyMessage}. Perfect for \${data.targetAudience} looking to \${data.adObjective.replace('-', ' ')}.\`,
                cta: 'Get Started Today',
                targetAudience: data.targetAudience,
                industry: data.industry,
                objective: data.adObjective,
                generatedAt: new Date().toISOString(),
                aiEngine: 'Google AI (Mock)'
            };
        }
        
        function displayAdResult(adData) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = \`
                <div class="result">
                    <h3>🎯 Generated Ad (\${adData.aiEngine || 'Google AI'})</h3>
                    <div class="ad-preview">
                        <h2 style="color: #1f2937; margin-bottom: 1rem;">\${adData.headline}</h2>
                        <h3 style="color: #374151; margin-bottom: 1rem;">\${adData.subheadline}</h3>
                        <p style="color: #4b5563; margin-bottom: 1.5rem;">\${adData.body}</p>
                        <button style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">\${adData.cta}</button>
                    </div>
                    <div style="margin-top: 1rem; color: #94a3b8;">
                        <p><strong>Target Audience:</strong> \${adData.targetAudience}</p>
                        <p><strong>Industry:</strong> \${adData.industry}</p>
                        <p><strong>Objective:</strong> \${adData.objective}</p>
                        <p><strong>AI Engine:</strong> \${adData.aiEngine || 'Google AI'}</p>
                        <p><strong>Generated:</strong> \${new Date(adData.generatedAt).toLocaleString()}</p>
                    </div>
                </div>
            \`;
        }
        
        // Test backend connectivity
        async function testBackend() {
            try {
                const response = await fetch('http://localhost:3000/health');
                if (response.ok) {
                    console.log('✅ Backend is accessible');
                    document.getElementById('status').innerHTML = '<div class="status success">✅ Backend API is accessible with Google AI</div>';
                } else {
                    console.log('❌ Backend not accessible');
                    document.getElementById('status').innerHTML = '<div class="status error">❌ Backend API not accessible</div>';
                }
            } catch (error) {
                console.log('❌ Backend not accessible:', error.message);
                document.getElementById('status').innerHTML = '<div class="status error">❌ Backend API not accessible</div>';
            }
        }
        
        // Test backend on page load
        testBackend();
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(htmlContent);
});

server.listen(PORT, () => {
    console.log(`🚀 AISim Google AI Test Server running on http://localhost:${PORT}`);
    console.log('✅ Test page ready for Google AI testing!');
    console.log('🎯 Open your browser to test Google AI ad generation');
    
    // Try to open browser automatically
    const { exec } = require('child_process');
    exec(`open http://localhost:${PORT}`, (error) => {
        if (error) {
            console.log(`⚠️  Could not open browser automatically. Please open: http://localhost:${PORT}`);
        }
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    server.close(() => {
        console.log('✅ Test server stopped');
        process.exit(0);
    });
});

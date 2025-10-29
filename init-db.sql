-- AISim Automated Ad System Database Initialization
-- This script creates all necessary tables and indexes

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS aisim_ads;

-- Use the database
\c aisim_ads;

-- Create leads table
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
);

-- Create orders table
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
);

-- Create ads table
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
);

-- Create analytics_events table
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
);

-- Create payment_failures table
CREATE TABLE IF NOT EXISTS payment_failures (
    id SERIAL PRIMARY KEY,
    stripe_payment_intent_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_ads_payment_intent_id ON ads(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ad_id ON analytics_events(ad_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Insert sample data for testing
INSERT INTO leads (id, company_name, website, industry, contact_email, contact_name, estimated_size, source, status) VALUES
('lead_001', 'TechCorp Inc', 'https://techcorp.com', 'Technology', 'contact@techcorp.com', 'John Smith', '50-100', 'google-places', 'new'),
('lead_002', 'MarketingPro LLC', 'https://marketingpro.com', 'Marketing', 'hello@marketingpro.com', 'Sarah Johnson', '10-50', 'brave-search', 'new'),
('lead_003', 'RetailMax Corp', 'https://retailmax.com', 'Retail', 'info@retailmax.com', 'Mike Davis', '100-500', 'google-places', 'new')
ON CONFLICT (id) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aisim;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aisim;

COMMIT;

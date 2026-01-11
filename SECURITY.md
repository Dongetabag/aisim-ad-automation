# Security Policy

## 🔒 Security Best Practices

This document outlines security best practices for the AISim Ad Automation platform.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to:
- **Email**: security@aisim.com
- **PGP Key**: Available upon request

**Please do NOT:**
- Open a public GitHub issue for security vulnerabilities
- Discuss vulnerabilities in public forums or social media
- Attempt to exploit vulnerabilities in production systems

We will respond to security reports within 48 hours and provide updates as we investigate.

## 🔐 API Key Security

### Critical Rules

1. **NEVER commit API keys to source control**
   - All API keys must be stored in environment variables
   - The `.env` file is in `.gitignore` and should never be committed
   - Use `env.example` as a template with placeholder values only

2. **Use different keys for development and production**
   - Development: Use test/sandbox API keys
   - Production: Use live API keys with proper restrictions

3. **Rotate keys regularly**
   - Rotate all API keys every 90 days
   - Immediately rotate if a key may have been compromised
   - Keep track of key rotation dates

4. **Set API restrictions**
   - Google API: Restrict by IP address and HTTP referrer
   - Stripe: Use webhook secrets and verify signatures
   - Limit API scopes to only what's needed

### Environment Variable Management

```bash
# ✅ CORRECT - Using environment variables
const apiKey = process.env.GOOGLE_API_KEY;

# ❌ WRONG - Hardcoding API keys
const apiKey = 'AIzaSyAUdihaqNym1hM9XqP4M-zi5WacdCGoBpU';
```

## 🛡️ Application Security

### Authentication & Authorization

1. **JWT Tokens**
   - Minimum 32 characters for JWT_SECRET
   - Set appropriate expiration times
   - Use RS256 algorithm for production
   - Store tokens securely (httpOnly cookies)

2. **Password Security**
   - Minimum 12 characters required
   - Use bcrypt with cost factor 12+
   - Implement rate limiting on auth endpoints
   - Add account lockout after failed attempts

3. **Session Management**
   - Use secure, httpOnly cookies
   - Implement CSRF protection
   - Set appropriate session timeouts
   - Invalidate sessions on logout

### Input Validation

1. **Server-Side Validation**
   - Always validate on the server (never trust client)
   - Use express-validator for all inputs
   - Sanitize HTML and SQL inputs
   - Validate file uploads (type, size, content)

2. **SQL Injection Prevention**
   - Use parameterized queries
   - Never concatenate user input into SQL
   - Use ORM/query builders when possible
   - Validate and sanitize all inputs

3. **XSS Prevention**
   - Escape all user-generated content
   - Use Content Security Policy headers
   - Sanitize HTML in rich text fields
   - Validate URLs and redirects

### Rate Limiting

The application includes built-in rate limiting:

```typescript
// General API: 100 requests per 15 minutes
app.use('/api', apiLimiter);

// Expensive operations: 10 requests per 15 minutes
app.post('/api/intake/generate-ad', strictLimiter, ...);

// Payment operations: 5 requests per 15 minutes
app.post('/api/payment/*', paymentLimiter, ...);
```

### Security Headers

Security headers are configured via Helmet:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## 🔍 Monitoring & Logging

### What to Log

✅ **DO log:**
- Authentication attempts (success and failure)
- Authorization failures
- Input validation failures
- Application errors and exceptions
- Rate limit violations
- Security-relevant events

❌ **DON'T log:**
- Passwords (even hashed)
- API keys or tokens
- Credit card numbers
- Personal identification information
- Session tokens

### Log Security

1. **Structured Logging**
   - Use JSON format for machine parsing
   - Include timestamp, level, and context
   - Redact sensitive data automatically

2. **Log Storage**
   - Store logs securely with access controls
   - Encrypt logs at rest
   - Implement log retention policies
   - Use centralized log management

3. **Monitoring**
   - Set up alerts for security events
   - Monitor for unusual patterns
   - Track error rates and response times
   - Alert on failed authentication attempts

## 🗄️ Database Security

### PostgreSQL Security

1. **Access Control**
   - Use strong passwords (minimum 20 characters)
   - Restrict network access (whitelist IPs)
   - Use SSL/TLS for connections
   - Create separate users with minimal privileges

2. **Data Protection**
   - Encrypt sensitive data at rest
   - Use encrypted connections (SSL/TLS)
   - Implement regular backups
   - Test backup restoration

3. **Query Security**
   - Use parameterized queries
   - Avoid dynamic SQL with user input
   - Validate all inputs
   - Use stored procedures for complex operations

### Redis Security

1. **Configuration**
   - Require authentication (requirepass)
   - Bind to localhost or private network
   - Disable dangerous commands
   - Use SSL/TLS for connections

2. **Data Handling**
   - Don't store sensitive data without encryption
   - Set appropriate TTLs
   - Regularly flush unused keys
   - Monitor memory usage

## 🐳 Docker Security

### Image Security

1. **Base Images**
   - Use official images from trusted sources
   - Use specific version tags (not `latest`)
   - Regularly update base images
   - Scan images for vulnerabilities

2. **Build Process**
   - Use multi-stage builds to minimize image size
   - Don't include secrets in images
   - Use .dockerignore to exclude sensitive files
   - Run as non-root user when possible

### Container Security

1. **Runtime**
   - Limit container resources (CPU, memory)
   - Use read-only file systems where possible
   - Drop unnecessary capabilities
   - Use security scanning tools

2. **Networking**
   - Use private networks for internal communication
   - Don't expose unnecessary ports
   - Use reverse proxy for public access
   - Implement network segmentation

## 🌐 Network Security

### HTTPS/TLS

1. **SSL/TLS Configuration**
   - Use TLS 1.2 or higher
   - Use strong cipher suites
   - Enable HSTS headers
   - Implement certificate pinning

2. **Certificates**
   - Use Let's Encrypt for free certificates
   - Automate certificate renewal
   - Monitor certificate expiration
   - Use wildcard certificates for subdomains

### Firewall

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH (restrict to your IP)

# Block everything else
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
```

## 📱 API Security

### Stripe Integration

1. **Webhook Security**
   - Always verify webhook signatures
   - Use webhook secrets
   - Validate all webhook events
   - Implement idempotency

2. **Payment Processing**
   - Never store credit card numbers
   - Use Stripe's secure elements
   - Implement 3D Secure when required
   - Log all payment events

### External APIs

1. **API Keys**
   - Store in environment variables
   - Never expose in client-side code
   - Use backend proxy for API calls
   - Implement key rotation

2. **Rate Limiting**
   - Respect API rate limits
   - Implement exponential backoff
   - Cache responses when appropriate
   - Monitor API usage

## 🔄 Dependency Management

### NPM Security

```bash
# Audit dependencies regularly
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for updates
npm outdated

# Update dependencies
npm update
```

### Best Practices

1. **Regular Updates**
   - Update dependencies monthly
   - Test updates in staging first
   - Review changelogs for breaking changes
   - Pin exact versions in production

2. **Vulnerability Scanning**
   - Use GitHub Dependabot
   - Run npm audit in CI/CD
   - Use Snyk or similar tools
   - Subscribe to security advisories

## 🚨 Incident Response

### If a Security Incident Occurs

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence (logs, snapshots)
   - Rotate all API keys and secrets
   - Notify affected users if required

2. **Investigation**
   - Determine scope and impact
   - Identify root cause
   - Document timeline of events
   - Check for data breach

3. **Recovery**
   - Apply security patches
   - Restore from clean backups
   - Update security measures
   - Monitor for reoccurrence

4. **Post-Incident**
   - Conduct post-mortem
   - Update security procedures
   - Implement preventive measures
   - Document lessons learned

## 📋 Security Checklist

Use this checklist before deploying to production:

### Application Security
- [ ] All API keys stored in environment variables
- [ ] Strong secrets generated (JWT_SECRET, ENCRYPTION_KEY)
- [ ] Rate limiting configured and tested
- [ ] Input validation on all endpoints
- [ ] CSRF protection enabled
- [ ] XSS prevention measures in place
- [ ] SQL injection prevention verified
- [ ] Error messages don't expose sensitive data
- [ ] Security headers configured (Helmet)
- [ ] HTTPS/TLS enabled with valid certificate

### Database Security
- [ ] Strong database password (20+ characters)
- [ ] Database access restricted to backend only
- [ ] SSL/TLS connection enabled
- [ ] Regular backups configured
- [ ] Backup restoration tested
- [ ] Sensitive data encrypted at rest

### Infrastructure Security
- [ ] Firewall configured and enabled
- [ ] Unnecessary ports closed
- [ ] SSH access restricted to specific IPs
- [ ] Docker images scanned for vulnerabilities
- [ ] Container resources limited
- [ ] Logs centralized and monitored
- [ ] Alerts configured for security events

### Monitoring
- [ ] Health check endpoints working
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Security event logging active
- [ ] Alert notifications tested
- [ ] Backup monitoring in place

### Compliance
- [ ] GDPR compliance verified (if applicable)
- [ ] PCI DSS compliance verified (payments)
- [ ] Privacy policy updated
- [ ] Terms of service current
- [ ] Data retention policies defined
- [ ] User consent mechanisms in place

## 📚 Resources

### Security Tools
- **OWASP ZAP**: Web application security testing
- **Snyk**: Dependency vulnerability scanning
- **npm audit**: Built-in npm security auditing
- **Trivy**: Container image scanning
- **CodeQL**: Static code analysis

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [PCI DSS](https://www.pcisecuritystandards.org/)
- [GDPR](https://gdpr.eu/)

### Learning Resources
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

## 📞 Contact

For security concerns or questions:
- **Email**: security@aisim.com
- **Documentation**: https://docs.aisim.com/security
- **Bug Bounty**: Contact for details

---

**Last Updated**: 2024-01-11
**Version**: 1.0.0

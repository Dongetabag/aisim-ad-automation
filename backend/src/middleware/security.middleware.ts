/**
 * Security and rate limiting middleware configuration
 */
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * General API rate limiter
 * Limit: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
});

/**
 * Strict rate limiter for expensive operations
 * Limit: 10 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests for this operation, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment operations rate limiter
 * Limit: 5 requests per 15 minutes per IP
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many payment requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Request sanitization middleware
 * Prevents common injection attacks
 * 
 * Note: This provides basic protection. For HTML content, validation should be done
 * at the controller level using proper HTML sanitization libraries like DOMPurify.
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Recursively sanitize an object by detecting and rejecting potentially dangerous content
 * For production use, consider using a library like validator.js or DOMPurify
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Detect potentially dangerous patterns
    const dangerousPatterns = [
      /<script/i,          // Script tags
      /javascript:/i,      // JavaScript protocol
      /vbscript:/i,        // VBScript protocol
      /data:text\/html/i,  // Data URLs with HTML
      /on\w+\s*=/i,        // Event handlers
    ];
    
    // Check for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(obj)) {
        // Return empty string or throw error based on your security policy
        // For production, you might want to throw an error instead
        return '';
      }
    }
    
    return obj.trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Error handler middleware
 * Prevents exposing sensitive error details in production
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
}

/**
 * Request logging middleware
 * Logs all incoming requests in a structured format
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log request
  console.log(`➡️  ${req.method} ${req.path}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

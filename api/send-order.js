// Ensure environment variables are loaded (for development)
import 'dotenv/config';

// Rate limiting storage (in production, use Redis or similar for distributed systems)
const RATE_LIMIT_STORE = new Map();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 5, // Maximum requests per window
  WINDOW_MS: 60 * 60 * 1000, // 1 hour window
};

// CORS configuration
// In production, restrict to specific origins
// In development, allow all for testing
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : isProduction ? [] : ['*']; // Empty array means no CORS allowed unless specified

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

/**
 * Check if request is within rate limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = RATE_LIMIT_STORE.get(ip) || [];
  
  // Filter out requests outside the time window
  const recentRequests = userRequests.filter(
    (time) => now - time < RATE_LIMIT_CONFIG.WINDOW_MS
  );

  if (recentRequests.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    return false;
  }

  // Add current request
  recentRequests.push(now);
  RATE_LIMIT_STORE.set(ip, recentRequests);
  
  // Clean up old entries periodically (basic cleanup)
  if (RATE_LIMIT_STORE.size > 1000) {
    const oldestKey = RATE_LIMIT_STORE.keys().next().value;
    RATE_LIMIT_STORE.delete(oldestKey);
  }

  return true;
}

/**
 * Sanitize input string - remove potentially harmful characters and limit length
 */
function sanitizeInput(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove angle brackets to prevent HTML injection
}

/**
 * Set CORS headers
 */
function setCORSHeaders(res, origin) {
  // If no allowed origins configured and in production, deny all
  if (ALLOWED_ORIGINS.length === 0 && isProduction) {
    // Don't set CORS headers - deny all origins
    return;
  }
  
  // Allow all origins in development or if explicitly set
  const allowedOrigin = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
    ? origin || '*'
    : ALLOWED_ORIGINS[0] || '*';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptionsRequest(req, res) {
  setCORSHeaders(res, req.headers.origin);
  res.status(204).end();
  return true;
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    handleOptionsRequest(req, res);
    return;
  }

  // Set CORS headers for all responses
  setCORSHeaders(res, req.headers.origin);

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
    return;
  }

  // Validate request body
  const { message } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    // Log error without exposing request body in production
    if (!isProduction) {
      console.error('❌ Invalid message in request:', { 
        type: typeof message,
        hasBody: !!req.body 
      });
    } else {
      console.error('❌ Invalid message in request');
    }
    res.status(400).json({ 
      error: 'Invalid message',
      message: 'The order message is missing or empty. Please try again.'
    });
    return;
  }

  // Basic size cap to avoid abuse (Telegram limit is large, we cap smaller)
  if (message.length > 2000) {
    res.status(413).json({ error: 'Message too long' });
    return;
  }

  // Get environment variables
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Debug logging (only in development, never log actual values)
  if (!isProduction) {
    console.log('🔍 Environment check in handler:');
    console.log(`   TELEGRAM_BOT_TOKEN: ${botToken ? '✅ Found' : '❌ Missing'}`);
    console.log(`   TELEGRAM_CHAT_ID: ${chatId ? '✅ Found' : '❌ Missing'}`);
  }

  if (!botToken || !chatId) {
    // Don't expose configuration details in production logs
    console.error('❌ Missing Telegram configuration - Cannot proceed');
    if (!isProduction) {
      console.error(`   BOT_TOKEN exists: ${!!botToken}`);
      console.error(`   CHAT_ID exists: ${!!chatId}`);
    }
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    if (!response.ok) {
      // Don't expose full error details to client
      const errorText = await response.text();
      // Only log full error in development
      if (!isProduction) {
        console.error('Telegram API error:', errorText);
      } else {
        console.error('Telegram API error: Failed to send message');
      }
      
      // Sanitize error response - don't expose internal details
      res.status(502).json({
        error: 'Failed to send message',
        message: 'Unable to process your order. Please try again later.',
      });
      return;
    }

    await response.json();
    res.status(200).json({ ok: true, success: true });
  } catch (err) {
    // Log error but don't expose details to client
    // In production, don't log full error messages
    if (!isProduction) {
      console.error('Server error:', err.message);
    } else {
      console.error('Server error: An unexpected error occurred');
    }
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request.',
    });
  }
}



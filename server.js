/**
 * Development server for local testing
 * This allows the API to work in development before deploying to Vercel
 * 
 * Usage: node server.js
 * Then visit http://localhost:5173 (or your Vite port)
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the same directory as server.js
const envPath = join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('\n⚠️  Error loading .env file:', result.error);
} else {
  console.log('\n✅ .env file loaded from:', envPath);
}

// Log environment variables on startup (for debugging)
console.log('\n🔍 Environment check on startup:');
console.log(`   TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Loaded (' + process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...)' : '❌ Not found'}`);
console.log(`   TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID ? '✅ Loaded (' + process.env.TELEGRAM_CHAT_ID + ')' : '❌ Not found'}`);

// IMPORTANT: Import handler AFTER loading environment variables
// This ensures the handler module has access to process.env
import handler from './api/send-order.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configure CORS to allow all origins in development only
// In production, this should be restricted to your domain
const isDev = process.env.NODE_ENV !== 'production';
app.use(cors({
  origin: isDev ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));
app.use(express.json());

// Serve static files from dist (if built)
app.use(express.static(join(__dirname, 'dist')));

// API route - adapt Vercel handler to Express format
app.post('/api/send-order', async (req, res) => {
  try {
    // Debug: Log environment variables when API is called (only in development)
    if (isDev) {
      console.log('\n📨 API Request received:');
      console.log(`   TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Available' : '❌ Missing'}`);
      console.log(`   TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID ? '✅ Available' : '❌ Missing'}`);
      // Don't log full request body as it may contain sensitive user data
      console.log(`   Request received: ${req.method} ${req.path}`);
    }
    
    // Convert Express request/response to Vercel format
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      connection: {
        remoteAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      },
    };

    // Track if response has been sent to prevent double responses
    let responseSent = false;
    
    const vercelRes = {
      status: (code) => {
        if (!responseSent) {
          res.status(code);
        }
        return vercelRes;
      },
      json: (data) => {
        if (!responseSent) {
          responseSent = true;
          res.json(data);
        }
        return vercelRes;
      },
      setHeader: (name, value) => {
        if (!responseSent) {
          res.setHeader(name, value);
        }
        return vercelRes;
      },
      end: () => {
        if (!responseSent) {
          responseSent = true;
          res.end();
        }
        return vercelRes;
      },
    };

    // Call the handler with error handling
    await handler(vercelReq, vercelRes);
  } catch (error) {
    // Handle any unexpected errors from the handler
    console.error('❌ Unexpected error in API route:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request.',
      });
    }
  }
});

// Handle OPTIONS requests for CORS preflight
app.options('/api/send-order', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Development server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/send-order`);
  
  // Check if .env file exists
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) {
    console.log(`\n⚠️  WARNING: .env file not found at ${envPath}`);
    console.log(`   Create a .env file with:`);
    console.log(`   TELEGRAM_BOT_TOKEN=your_bot_token_here`);
    console.log(`   TELEGRAM_CHAT_ID=your_chat_id_here`);
  }
  
  // Check if environment variables are set
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.log(`\n⚠️  WARNING: Environment variables not set!`);
    console.log(`   - TELEGRAM_BOT_TOKEN: ${botToken ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - TELEGRAM_CHAT_ID: ${chatId ? '✅ Set' : '❌ Missing'}`);
    console.log(`\n   The API will not work until these are set.`);
    console.log(`   See DEVELOPMENT_SETUP.md for instructions.`);
  } else {
    console.log(`\n✅ Environment variables loaded successfully!`);
    console.log(`   - TELEGRAM_BOT_TOKEN: ✅ Set`);
    console.log(`   - TELEGRAM_CHAT_ID: ✅ Set`);
  }
});


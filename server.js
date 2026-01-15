// Production server for Hostinger Node.js hosting
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Load .env file if it exists (for Hostinger)
// Hostinger stores .env file at: public_html/builds/config/.env
console.log('=== Environment Variable Loader ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Try multiple possible locations
// NOTE: Hostinger uses .builds (with dot) not builds!
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '.builds', 'config', '.env'), // THIS IS THE CORRECT PATH!
  path.join(process.cwd(), 'builds', 'config', '.env'),
  path.join(process.cwd(), '..', '.builds', 'config', '.env'),
  '/home/u439392007/domains/admin.asoldi.com/public_html/.builds/config/.env',
];

let envFileFound = false;
let envVarsLoaded = 0;

for (const envPath of envPaths) {
  try {
    if (fs.existsSync(envPath)) {
      console.log(`✓ Found .env file at: ${envPath}`);
      envFileFound = true;
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log(`File size: ${envContent.length} bytes`);
      
      envContent.split('\n').forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            
            // Remove surrounding quotes (single or double)
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            
            // Always set (override if exists) for custom vars
            process.env[key] = value;
            envVarsLoaded++;
            console.log(`  Loaded: ${key} = ${value.substring(0, 20)}... (length: ${value.length})`);
          }
        }
      });
      console.log(`Total variables loaded from .env: ${envVarsLoaded}`);
      break;
    } else {
      console.log(`✗ Not found: ${envPath}`);
    }
  } catch (error) {
    console.log(`✗ Error checking ${envPath}:`, error.message);
  }
}

if (!envFileFound) {
  console.log('⚠ WARNING: .env file not found in any of the checked locations!');
  console.log('Checked paths:', envPaths);
}

console.log('=== End Environment Variable Loader ===');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Log environment variables at startup (for debugging - remove sensitive data in production)
console.log('Server starting with environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', port);
console.log('WORDPRESS_URL:', process.env.WORDPRESS_URL ? 'SET' : 'NOT SET');
console.log('WORDPRESS_USERNAME:', process.env.WORDPRESS_USERNAME ? `SET (length: ${process.env.WORDPRESS_USERNAME.length})` : 'NOT SET');
console.log('WORDPRESS_APP_PASSWORD:', process.env.WORDPRESS_APP_PASSWORD ? `SET (length: ${process.env.WORDPRESS_APP_PASSWORD.length})` : 'NOT SET');
console.log('All WORD* env vars:', Object.keys(process.env).filter(k => k.includes('WORD')).join(', '));

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});


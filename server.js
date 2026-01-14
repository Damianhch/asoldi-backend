// Production server for Hostinger Node.js hosting
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Load .env file if it exists (for Hostinger)
// Hostinger stores .env file at: public_html/builds/config/.env
// Try multiple possible locations
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'builds', 'config', '.env'),
  path.join(process.cwd(), '..', 'builds', 'config', '.env'),
  '/home/u439392007/domains/admin.asoldi.com/public_html/builds/config/.env',
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading .env file from: ${envPath}`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
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
          
          // Only set if not already in process.env
          if (!process.env[key]) {
            process.env[key] = value;
            console.log(`Loaded ${key} from .env file`);
          }
        }
      }
    });
    break;
  }
}

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


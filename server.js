import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');

function findAvailablePort(startPort, maxAttempts = 100) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    let attempts = 0;

    const tryListen = () => {
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find available port after ${maxAttempts} attempts`));
        return;
      }

      const server = http.createServer((req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        // Serve static files from dist
        let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

        // Check if file exists
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          const contentTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
          };
          res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        // API proxy - only POST
        if (req.method !== 'POST') {
          // Fallback to index.html for SPA routing
          const indexPath = path.join(DIST_DIR, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream(indexPath).pipe(res);
            return;
          }
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not Found' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          let requestData;
          try {
            requestData = JSON.parse(body);
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }

          const targetUrl = requestData.apiUrl;
          const apiKey = requestData.apiKey;
          const model = requestData.model;
          const prompt = requestData.prompt;
          const maxTokens = requestData.max_tokens || 1024;
          const provider = requestData.provider || 'anthropic';

          if (!targetUrl || !apiKey || !model || !prompt) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
          }

          const urlObj = new URL(targetUrl);
          const isHttps = urlObj.protocol === 'https:';
          const port = urlObj.port || (isHttps ? 443 : 80);

          const headers = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          };

          // Add anthropic-version header only for Anthropic provider
          if (provider === 'anthropic') {
            headers['anthropic-version'] = '2023-06-01';
          }

          const options = {
            hostname: urlObj.hostname,
            port: port,
            path: urlObj.pathname,
            method: 'POST',
            headers: headers
          };

          const lib = isHttps ? https : http;

          const proxyReq = lib.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', chunk => { data += chunk; });
            proxyRes.on('end', () => {
              res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(data);
            });
          });

          proxyReq.on('error', (err) => {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });

          if (provider === 'openai') {
            proxyReq.write(JSON.stringify({
              model: model,
              max_tokens: maxTokens,
              messages: [{ role: 'user', content: prompt }]
            }));
          } else {
            proxyReq.write(JSON.stringify({
              model: model,
              max_tokens: maxTokens,
              messages: [{ role: 'user', content: prompt }]
            }));
          }
          proxyReq.end();
        });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          port++;
          tryListen();
        } else {
          reject(err);
        }
      });

      server.listen(port, () => {
        resolve({ server, port });
      });
    };

    tryListen();
  });
}

findAvailablePort(3000)
  .then(({ server, port }) => {
    console.log(`Server running at http://localhost:${port}`);
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

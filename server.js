import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');

// 统一的请求转发函数
function proxyRequest(targetUrl, options, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(targetUrl);
    const isHttps = urlObj.protocol === 'https:';
    const port = urlObj.port || (isHttps ? 443 : 80);

    const reqOptions = {
      hostname: urlObj.hostname,
      port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const lib = isHttps ? https : http;

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// API 路由处理
const apiHandlers = {
  // GET /api/models - 获取模型列表
  async GET_models(searchParams) {
    const apiHost = searchParams.get('apiHost');
    const apiKey = searchParams.get('apiKey');
    const provider = searchParams.get('provider') || 'anthropic';

    if (!apiHost || !apiKey) {
      return { status: 400, body: { error: 'Missing apiHost or apiKey' } };
    }

    const baseUrl = apiHost.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/v1/models`;

    const headers = { 'Authorization': `Bearer ${apiKey}` };
    if (provider === 'anthropic') {
      headers['anthropic-version'] = '2023-06-01';
    }

    try {
      const result = await proxyRequest(targetUrl, { method: 'GET', headers });
      return { status: result.statusCode, body: result.data, isRaw: true };
    } catch (err) {
      return { status: 502, body: { error: err.message } };
    }
  },

  // POST /api/chat - 聊天请求
  async POST_chat(body) {
    const { apiUrl, apiKey, model, prompt, maxTokens, provider } = body;

    if (!apiUrl || !apiKey || !model || !prompt) {
      return { status: 400, body: { error: 'Missing required fields' } };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    if (provider === 'anthropic') {
      headers['anthropic-version'] = '2023-06-01';
    }

    const postData = JSON.stringify({
      model,
      max_tokens: maxTokens || 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const result = await proxyRequest(apiUrl, { method: 'POST', headers }, postData);
      return { status: result.statusCode, body: result.data, isRaw: true };
    } catch (err) {
      return { status: 502, body: { error: err.message } };
    }
  }
};

// 路由匹配
function matchRoute(method, urlPath) {
  if (method === 'GET' && urlPath === '/api/models') {
    return { handler: 'GET_models' };
  }
  if (method === 'POST' && urlPath === '/api/chat') {
    return { handler: 'POST_chat' };
  }
  return null;
}

function findAvailablePort(startPort, maxAttempts = 100) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    let attempts = 0;

    const tryListen = () => {
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find available port after ${maxAttempts} attempts`));
        return;
      }

      const server = http.createServer(async (req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const url = new URL(req.url, `http://localhost:${port}`);
        const route = matchRoute(req.method, url.pathname);

        if (route) {
          try {
            let result;
            if (route.handler === 'GET_models') {
              result = await apiHandlers.GET_models(url.searchParams);
            } else if (route.handler === 'POST_chat') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              await new Promise(resolve => req.on('end', resolve));
              result = await apiHandlers.POST_chat(JSON.parse(body || '{}'));
            }

            res.writeHead(result.status, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            const bodyStr = result.isRaw ? result.body : JSON.stringify(result.body);
            res.end(bodyStr);
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 静态文件服务
        let filePath = path.join(DIST_DIR, url.pathname === '/' ? '/index.html' : url.pathname);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          const contentTypes = {
            '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
            '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
          };
          res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        // SPA fallback
        const indexPath = path.join(DIST_DIR, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
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

      server.listen(port, () => resolve({ server, port }));
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

const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Создание прокси-сервера
const proxy = httpProxy.createProxyServer({});

// Обработка HTTP и HTTPS запросов
const server = http.createServer((req, res) => {
  const target = req.url.startsWith('/wss') ? `wss://${req.headers.host}` : `https://${req.headers.host}`;
  const parsedUrl = url.parse(req.url);
  const proxyUrl = parsedUrl.pathname.replace('/wss', '');
  
  // Обновляем URL для проксирования
  req.url = proxyUrl;
  
  // Устанавливаем заголовки для CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Проксирование запроса
  proxy.web(req, res, { target: target, changeOrigin: true });
});

// Обработка WebSocket запросов
server.on('upgrade', (req, socket, head) => {
  const target = `wss://${req.headers.host}`;
  const parsedUrl = url.parse(req.url);
  const proxyUrl = parsedUrl.pathname.replace('/wss', '');
  
  // Обновляем URL для проксирования
  req.url = proxyUrl;

  proxy.ws(req, socket, head, { target: target, changeOrigin: true });
});

// Запуск сервера
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;

server.listen(port, host, () => {
  console.log(`Proxy server running on ${host}:${port}`);
});

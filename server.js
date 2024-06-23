const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Разрешить CORS для всех маршрутов
app.use(cors(corsOptions));

// Прокси для API запросов
app.use('/api', createProxyMiddleware({
  target: 'https://platform.fintacharts.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Оставьте без изменений
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('origin', 'https://platform.fintacharts.com');
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
}));

// Прокси для запросов на авторизацию
app.use('/identity', createProxyMiddleware({
  target: 'https://platform.fintacharts.com',
  changeOrigin: true,
  pathRewrite: {
    '^/identity': '/identity',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('origin', 'https://platform.fintacharts.com');
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
}));

// Прокси для WebSocket запросов
app.use('/wss', createProxyMiddleware({
  target: 'wss://platform.fintacharts.com',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/wss': '/api/streaming/ws/v1/realtime', // перепишите путь для WebSocket
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    proxyReq.setHeader('origin', 'wss://platform.fintacharts.com');
  }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});

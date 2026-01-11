require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '脳の一時置き場 API is running',
    timestamp: new Date().toISOString()
  });
});

// ルート
const processVoiceRouter = require('./routes/processVoice');
app.use('/api', processVoiceRouter);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'サーバーエラーが発生しました',
      code: 'SERVER_ERROR'
    }
  });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'エンドポイントが見つかりません',
      code: 'NOT_FOUND'
    }
  });
});

// サーバー起動
// 0.0.0.0 で全てのネットワークインターフェースからのアクセスを許可
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🎤 Process voice: POST http://localhost:${PORT}/api/process-voice`);
  console.log(`📱 iPhone access: http://172.20.10.2:${PORT}`);
});

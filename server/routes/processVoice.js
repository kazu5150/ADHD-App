const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const { processVoice } = require('../services/openaiService');

/**
 * POST /api/process-voice
 * 音声ファイルを受け取り、AI整理した結果を返す
 */
router.post('/process-voice', uploadMiddleware, async (req, res) => {
  try {
    // req.fileはuploadMiddlewareでチェック済み
    const audioBuffer = req.file.buffer;
    const filename = req.file.originalname;

    console.log(`Processing voice: ${filename}, size: ${audioBuffer.length} bytes`);

    // OpenAI処理
    const result = await processVoice(audioBuffer, filename);

    // 成功レスポンス
    res.json({
      success: true,
      data: {
        transcript: result.transcript,
        summary: result.summary,
        category: result.category,
        suggestedTime: result.suggestedTime,
      },
    });
  } catch (error) {
    console.error('Process voice error:', error);

    // OpenAI APIエラーの判定
    if (error.message.includes('音声の文字起こし') || error.message.includes('AIによる整理')) {
      return res.status(503).json({
        success: false,
        error: {
          message: error.message,
          code: 'AI_SERVICE_ERROR',
        },
      });
    }

    // その他のエラー
    res.status(500).json({
      success: false,
      error: {
        message: 'サーバーエラーが発生しました',
        code: 'SERVER_ERROR',
      },
    });
  }
});

module.exports = router;

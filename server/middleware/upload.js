const multer = require('multer');

// メモリストレージ設定（ディスク保存しない）
const storage = multer.memoryStorage();

// ファイルフィルター（音声ファイルのみ許可）
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/m4a',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'video/mp4' // iOS録音でmp4コンテナになる場合がある
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('音声ファイル形式がサポートされていません（m4a, wav, mp3のみ）'), false);
  }
};

// multer設定
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

// 単一ファイルアップロード用ミドルウェア
const uploadAudio = upload.single('audioFile');

// エラーハンドリング付きラッパー
const uploadMiddleware = (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multerエラー
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ファイルサイズが大きすぎます（10MB以下にしてください）',
            code: 'FILE_TOO_LARGE',
          },
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          message: 'ファイルアップロードエラー',
          code: 'UPLOAD_ERROR',
        },
      });
    } else if (err) {
      // カスタムエラー（ファイル形式エラーなど）
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: 'INVALID_FILE_TYPE',
        },
      });
    }

    // ファイルが送信されていない
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: '音声ファイルが送信されていません',
          code: 'NO_FILE',
        },
      });
    }

    next();
  });
};

module.exports = uploadMiddleware;

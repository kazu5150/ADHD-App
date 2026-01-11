import { MemoCategory } from './memo';

/**
 * API共通レスポンス型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * APIエラー型
 */
export interface ApiError {
  message: string;
  code: string;
}

/**
 * POST /api/process-voice のレスポンスデータ
 */
export interface ProcessVoiceResponse {
  /** 音声認識結果 */
  transcript: string;

  /** AIによる1行要約 */
  summary: string;

  /** AIによる分類 */
  category: MemoCategory;

  /** AIが提案するリマインド時刻 (ISO 8601形式) */
  suggestedTime: string;
}

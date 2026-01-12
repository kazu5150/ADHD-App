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

  /** AIによる整理結果（Markdown形式） */
  organizedContent: string;

  /** 📌やること候補があるか */
  hasReminder: boolean;

  /** AIが提案するリマインド時刻 (ISO 8601形式) - 📌がある場合のみ */
  suggestedTime?: string;
}

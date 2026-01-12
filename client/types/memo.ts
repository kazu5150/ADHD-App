/**
 * メモの分類カテゴリー
 */
export type MemoCategory = '仕事' | '生活' | 'アイデア' | '不安・気がかり';

/**
 * メモのステータス
 */
export type MemoStatus = 'open' | 'done';

/**
 * メモデータの型定義
 */
export interface Memo {
  /** 一意なID (UUID) */
  id: string;

  /** 音声認識結果のテキスト */
  transcript: string;

  /** AIによる1行要約 */
  summary: string;

  /** AIによる分類 */
  category: MemoCategory;

  /** AIが提案するリマインド時刻 (ISO 8601形式) */
  suggestedTime: string;

  /** メモ作成日時 (ISO 8601形式) */
  createdAt: string;

  /** 通知ID (通知をキャンセルする際に使用) */
  notificationId?: string;

  /** メモのステータス (open: 未完了, done: 完了) */
  status: MemoStatus;
}

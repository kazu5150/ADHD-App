/**
 * メモの分類カテゴリー（新4分類）
 */
export type MemoCategory =
  | '🧠 考え事'
  | '😟 感情・不安'
  | '📌 やること候補'
  | '🗑 今は捨ててOK';

/**
 * メモのステータス
 */
export type MemoStatus = 'open' | 'done';

/**
 * メモデータの型定義
 */
export interface Memo {
  /** 一意なID */
  id: string;

  /** 音声認識結果のテキスト */
  transcript: string;

  /** AIによるMarkdown形式の整理結果 */
  organizedContent: string;

  /** リマインド設定有無（📌判定） */
  hasReminder: boolean;

  /** AIが提案するリマインド時刻（📌の場合のみ存在、ISO 8601形式） */
  suggestedTime?: string;

  /** メモ作成日時 (ISO 8601形式) */
  createdAt: string;

  /** 通知ID (通知をキャンセルする際に使用) */
  notificationId?: string;

  /** メモのステータス (open: 未完了, done: 完了) */
  status: MemoStatus;
}

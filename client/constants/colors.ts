/**
 * アプリケーションのカラーテーマ
 * 白/淡色ベース、情報量最小、静かなデザイン
 */
export const colors = {
  // 背景
  background: '#FFFFFF',
  card: '#F9F9F9',

  // テキスト
  text: '#333333',
  textLight: '#999999',

  // アクセント
  accent: '#E8F4F8',
  success: '#E8F8E8',

  // 録音ボタン
  record: '#4A90A4',
  recordActive: '#3A7A8E',

  // その他
  border: '#EEEEEE',
  disabled: '#CCCCCC',
} as const;

export type ColorKey = keyof typeof colors;

/**
 * アプリケーション設定
 */

// APIエンドポイント
// 開発環境: MacのローカルIPアドレスを使用（iPhoneからアクセス可能）
// 本番環境: 実際のAPIのURLに置き換える
//
// 【開発環境のIPアドレス】
// - Wi-Fi接続時: 192.168.0.18（自宅・職場のWi-Fi）
// - テザリング時: 172.20.10.2（iPhoneのインターネット共有）
export const API_URL = __DEV__
  ? 'http://192.168.0.18:3000'
  : 'https://your-production-api.com';

// ローカルストレージキー
export const STORAGE_KEYS = {
  MEMOS: 'memos',
} as const;

// メモ保存数の上限（MVP: 直近3件のみ）
export const MAX_MEMOS = 3;

// API タイムアウト（ミリ秒）
export const API_TIMEOUT = 30000; // 30秒

// アプリ設定
export const APP_CONFIG = {
  // 起動目標時間（ミリ秒）
  TARGET_LAUNCH_TIME: 3000,

  // 最大録音時間（ミリ秒）
  MAX_RECORDING_TIME: 120000, // 2分

  // 最小録音時間（ミリ秒）
  MIN_RECORDING_TIME: 1000, // 1秒
} as const;

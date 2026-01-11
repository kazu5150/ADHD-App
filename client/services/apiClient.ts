import { API_URL, API_TIMEOUT } from '../constants/config';
import { ApiResponse, ProcessVoiceResponse } from '../types/api';

/**
 * 音声ファイルをバックエンドに送信してAI整理を行う
 * @param audioUri - 録音ファイルのURI
 * @returns AI整理結果
 */
export async function processVoice(audioUri: string): Promise<ApiResponse<ProcessVoiceResponse>> {
  try {
    console.log('🚀 API呼び出し開始:', API_URL + '/api/process-voice');
    console.log('📁 音声ファイルURI:', audioUri);

    // FormDataを作成
    const formData = new FormData();

    // ファイルURIから拡張子を取得
    const fileExtension = audioUri.split('.').pop() || 'm4a';
    const fileName = `recording.${fileExtension}`;

    // 音声ファイルを追加
    // @ts-ignore - React NativeのFormDataは型定義が不完全
    formData.append('audioFile', {
      uri: audioUri,
      type: `audio/${fileExtension}`,
      name: fileName,
    });

    console.log('📤 ファイルアップロード中...');

    // タイムアウト制御
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}/api/process-voice`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 レスポンス受信:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ API呼び出し成功:', data);

      if (!data.success || !data.data) {
        throw new Error('APIレスポンスの形式が不正です');
      }

      return {
        success: true,
        data: {
          transcript: data.data.transcript,
          summary: data.data.summary,
          category: data.data.category,
          suggestedTime: data.data.suggestedTime,
        },
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('処理がタイムアウトしました。もう一度お試しください。');
      }

      throw error;
    }
  } catch (error: any) {
    console.error('❌ API呼び出しエラー:', error);

    // ネットワークエラーの場合
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'サーバーに接続できませんでした。ネットワーク接続を確認してください。'
      );
    }

    throw error;
  }
}

/**
 * ヘルスチェック
 * @returns サーバーが正常に動作しているか
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'OK';
  } catch (error) {
    console.error('ヘルスチェックエラー:', error);
    return false;
  }
}

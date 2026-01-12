import AsyncStorage from '@react-native-async-storage/async-storage';
import { Memo, MemoStatus } from '../types/memo';
import { STORAGE_KEYS, MAX_MEMOS } from '../constants/config';

/**
 * 全メモを取得（最新順）
 */
export async function getMemos(): Promise<Memo[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.MEMOS);
    if (!json) return [];

    const memos: any[] = JSON.parse(json);

    // 互換性レイヤー: 旧形式を新形式に変換
    const normalizedMemos: Memo[] = memos.map(memo => {
      if (!memo.organizedContent && memo.summary && memo.category) {
        // 旧形式 → 新形式に変換
        return {
          ...memo,
          transcript: memo.transcript || memo.summary || '',
          organizedContent: `これは仮の整理です。\n\n${memo.category}:\n・${memo.summary}`,
          hasReminder: !!memo.notificationId,
        };
      }
      // 新形式でもtranscriptが欠けている場合の対応
      if (!memo.transcript) {
        return {
          ...memo,
          transcript: memo.organizedContent ? memo.organizedContent.substring(0, 50) : '',
        } as Memo;
      }
      return memo as Memo;
    });

    // 最新順にソート（createdAt降順）
    return normalizedMemos.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('メモ読み込みエラー:', error);
    return [];
  }
}

/**
 * 新しいメモを保存（3件制限、古いものを削除）
 */
export async function saveMemo(memo: Memo): Promise<void> {
  try {
    const memos = await getMemos();

    // 新しいメモを先頭に追加
    memos.unshift(memo);

    // 3件を超えた分は削除
    const limitedMemos = memos.slice(0, MAX_MEMOS);

    await AsyncStorage.setItem(
      STORAGE_KEYS.MEMOS,
      JSON.stringify(limitedMemos)
    );

    console.log('✅ メモ保存成功:', memo.id);
  } catch (error) {
    console.error('❌ メモ保存エラー:', error);
    throw error;
  }
}

/**
 * メモのステータスを更新
 */
export async function updateMemoStatus(
  id: string,
  status: MemoStatus
): Promise<void> {
  try {
    const memos = await getMemos();
    const updated = memos.map(m =>
      m.id === id ? { ...m, status } : m
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.MEMOS,
      JSON.stringify(updated)
    );

    console.log('✅ ステータス更新成功:', id, '->', status);
  } catch (error) {
    console.error('❌ ステータス更新エラー:', error);
    throw error;
  }
}

/**
 * メモ全体を更新
 */
export async function updateMemo(updatedMemo: Memo): Promise<void> {
  try {
    const memos = await getMemos();
    const updated = memos.map(m =>
      m.id === updatedMemo.id ? updatedMemo : m
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.MEMOS,
      JSON.stringify(updated)
    );

    console.log('✅ メモ更新成功:', updatedMemo.id);
  } catch (error) {
    console.error('❌ メモ更新エラー:', error);
    throw error;
  }
}

/**
 * 全メモを削除（デバッグ用）
 */
export async function clearAllMemos(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MEMOS);
    console.log('✅ 全メモ削除成功');
  } catch (error) {
    console.error('❌ メモ削除エラー:', error);
    throw error;
  }
}

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import RecordingScreen from './screens/RecordingScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen, { EditedData } from './screens/CompleteScreen';
import MemoListScreen from './screens/MemoListScreen';
import MemoEditScreen from './screens/MemoEditScreen';
import * as notificationService from './services/notificationService';
import * as audioRecorder from './services/audioRecorder';
import * as apiClient from './services/apiClient';
import * as storageService from './services/storageService';
import { Memo } from './types/memo';

type Screen = 'home' | 'recording' | 'processing' | 'complete' | 'memoList' | 'memoEdit';

interface ProcessedData {
  organizedContent: string;
  hasReminder: boolean;
  suggestedTime?: string;
  transcript: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  // アプリ起動時の処理
  useEffect(() => {
    notificationService.getPermissions();
    audioRecorder.getPermissions();
    loadMemos();
  }, []);

  // メモを読み込む
  const loadMemos = async () => {
    try {
      const loadedMemos = await storageService.getMemos();
      setMemos(loadedMemos);
      console.log('✅ メモ読み込み成功:', loadedMemos.length, '件');
    } catch (error) {
      console.error('❌ メモ読み込みエラー:', error);
    }
  };

  // 録音開始
  const handleStartRecording = async () => {
    try {
      console.log('録音開始');
      await audioRecorder.startRecording();
      setCurrentScreen('recording');
    } catch (error) {
      console.error('録音開始エラー:', error);
      Alert.alert('エラー', '録音を開始できませんでした。マイクの権限を確認してください。');
    }
  };

  // 録音停止 → AI処理へ
  const handleStopRecording = async () => {
    try {
      console.log('録音停止 → AI処理開始');
      const uri = await audioRecorder.stopRecording();
      console.log('✅ 録音URI取得成功:', uri);
      setRecordingUri(uri);
      setCurrentScreen('processing');

      // 実際のAPI呼び出し
      console.log('🚀 バックエンドAPIにリクエスト送信中...');
      const response = await apiClient.processVoice(uri);

      if (response.success && response.data) {
        console.log('✅ AI整理完了:', response.data);
        setProcessedData({
          organizedContent: response.data.organizedContent,
          hasReminder: response.data.hasReminder,
          suggestedTime: response.data.suggestedTime,
          transcript: response.data.transcript,
        });
        setCurrentScreen('complete');
      } else {
        throw new Error('AI整理に失敗しました');
      }
    } catch (error: any) {
      console.error('❌ 処理エラー:', error);

      // エラーメッセージを表示
      const errorMessage = error.message || '録音の処理に失敗しました';
      Alert.alert(
        'エラー',
        errorMessage,
        [
          {
            text: 'もう一度',
            onPress: () => setCurrentScreen('home'),
          },
        ]
      );
      setCurrentScreen('home');
    }
  };

  // メモのステータスを変更
  const handleToggleMemoStatus = async (id: string) => {
    try {
      const memo = memos.find(m => m.id === id);
      if (!memo) return;

      const newStatus = memo.status === 'open' ? 'done' : 'open';

      // ステータスを更新
      await storageService.updateMemoStatus(id, newStatus);

      // 通知を制御
      if (newStatus === 'done' && memo.notificationId) {
        // 完了 → 通知をキャンセル
        await notificationService.cancelNotificationById(memo.notificationId);
      } else if (newStatus === 'open' && memo.notificationId && memo.suggestedTime) {
        // 未完了に戻す → 通知を再スケジュール（未来の時刻のみ）
        const reminderDate = new Date(memo.suggestedTime);
        if (reminderDate > new Date()) {
          await notificationService.scheduleNotification(
            reminderDate,
            'やること候補があります'
          );
        }
      }

      await loadMemos();
    } catch (error) {
      console.error('❌ ステータス変更エラー:', error);
      Alert.alert('エラー', 'ステータスの変更に失敗しました');
    }
  };

  // 一覧画面を開く
  const handleOpenMemoList = () => {
    setCurrentScreen('memoList');
  };

  // 一覧画面から戻る
  const handleBackFromMemoList = () => {
    setCurrentScreen('home');
  };

  // メモ編集画面を開く
  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setCurrentScreen('memoEdit');
  };

  // 編集画面から戻る
  const handleBackFromMemoEdit = () => {
    setEditingMemo(null);
    setCurrentScreen('memoList');
  };

  // メモを保存（編集）
  const handleSaveMemo = async (updatedMemo: Memo) => {
    try {
      // 既存の通知をキャンセル
      if (editingMemo?.notificationId) {
        await notificationService.cancelNotificationById(editingMemo.notificationId);
      }

      // 新しい通知をスケジュール（時刻が変更された場合）
      let newNotificationId = updatedMemo.notificationId;
      if (updatedMemo.hasReminder && updatedMemo.suggestedTime) {
        const reminderDate = new Date(updatedMemo.suggestedTime);
        if (reminderDate > new Date()) {
          newNotificationId = await notificationService.scheduleNotification(
            reminderDate,
            'やること候補があります'
          );
        }
      }

      // 更新されたメモを保存
      const memoToSave: Memo = {
        ...updatedMemo,
        notificationId: newNotificationId,
      };
      await storageService.updateMemo(memoToSave);
      await loadMemos();

      // 一覧画面に戻る
      setEditingMemo(null);
      setCurrentScreen('memoList');
    } catch (error) {
      console.error('❌ メモ保存エラー:', error);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  // メモを削除
  const handleDeleteMemo = async (id: string) => {
    try {
      const memo = memos.find(m => m.id === id);

      // 通知をキャンセル
      if (memo?.notificationId) {
        await notificationService.cancelNotificationById(memo.notificationId);
      }

      // メモを削除
      await storageService.deleteMemo(id);
      await loadMemos();

      // 一覧画面に戻る
      setEditingMemo(null);
      setCurrentScreen('memoList');
    } catch (error) {
      console.error('❌ メモ削除エラー:', error);
      Alert.alert('エラー', '削除に失敗しました');
    }
  };

  // 完了処理（ユーザーがOKボタンを押した時）
  const handleCompleteFinish = async (editedData: EditedData) => {
    if (!processedData) return;

    try {
      let notificationId: string | null = null;

      // 編集されたリマインド時刻を使用
      const finalSuggestedTime = editedData.suggestedTime || processedData.suggestedTime;

      // 📌ありの場合のみリマインド設定
      if (processedData.hasReminder && finalSuggestedTime) {
        const reminderDate = new Date(finalSuggestedTime);

        // 未来時刻チェック
        if (reminderDate > new Date()) {
          notificationId = await notificationService.scheduleNotification(
            reminderDate,
            'やること候補があります'
          );
          console.log('✅ リマインダー設定:', finalSuggestedTime);
        }
      }

      // 編集されたデータでメモを保存
      const newMemo: Memo = {
        id: Date.now().toString(),
        transcript: editedData.transcript,
        organizedContent: processedData.organizedContent,
        hasReminder: processedData.hasReminder,
        suggestedTime: finalSuggestedTime,
        createdAt: new Date().toISOString(),
        notificationId: notificationId || undefined,
        status: 'open',
      };

      await storageService.saveMemo(newMemo);
      await loadMemos();

      // ホームへ戻る
      setCurrentScreen('home');
      setProcessedData(null);
      setRecordingUri(null);
    } catch (error) {
      console.error('❌ 完了処理エラー:', error);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <>
      <StatusBar style="auto" />
      {currentScreen === 'home' && (
        <HomeScreen
          onStartRecording={handleStartRecording}
          memos={memos}
          onOpenMemoList={handleOpenMemoList}
        />
      )}
      {currentScreen === 'recording' && (
        <RecordingScreen onStopRecording={handleStopRecording} />
      )}
      {currentScreen === 'processing' && <ProcessingScreen />}
      {currentScreen === 'complete' && processedData && (
        <CompleteScreen
          organizedContent={processedData.organizedContent}
          hasReminder={processedData.hasReminder}
          suggestedTime={processedData.suggestedTime}
          transcript={processedData.transcript}
          onComplete={handleCompleteFinish}
        />
      )}
      {currentScreen === 'memoList' && (
        <MemoListScreen
          memos={memos}
          onToggleMemoStatus={handleToggleMemoStatus}
          onEditMemo={handleEditMemo}
          onBack={handleBackFromMemoList}
        />
      )}
      {currentScreen === 'memoEdit' && editingMemo && (
        <MemoEditScreen
          memo={editingMemo}
          onSave={handleSaveMemo}
          onDelete={handleDeleteMemo}
          onBack={handleBackFromMemoEdit}
        />
      )}
    </>
  );
}

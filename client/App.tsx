import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import RecordingScreen from './screens/RecordingScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen from './screens/CompleteScreen';
import * as notificationService from './services/notificationService';
import * as audioRecorder from './services/audioRecorder';
import * as apiClient from './services/apiClient';
import * as storageService from './services/storageService';
import { Memo } from './types/memo';

type Screen = 'home' | 'recording' | 'processing' | 'complete';

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

  // 新しいメモを保存
  const saveNewMemo = async (notificationId: string | null) => {
    if (!processedData) return;

    try {
      const newMemo: Memo = {
        id: Date.now().toString(),
        transcript: processedData.transcript,
        organizedContent: processedData.organizedContent,
        hasReminder: processedData.hasReminder,
        suggestedTime: processedData.suggestedTime,
        createdAt: new Date().toISOString(),
        notificationId: notificationId || undefined,
        status: 'open',
      };

      await storageService.saveMemo(newMemo);
      await loadMemos();
    } catch (error) {
      console.error('❌ メモ保存エラー:', error);
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


  // 完了処理（自動遷移後の処理）
  const handleCompleteFinish = async () => {
    if (!processedData) return;

    try {
      let notificationId: string | null = null;

      // 📌ありの場合のみリマインド設定
      if (processedData.hasReminder && processedData.suggestedTime) {
        const reminderDate = new Date(processedData.suggestedTime);

        // 未来時刻チェック
        if (reminderDate > new Date()) {
          notificationId = await notificationService.scheduleNotification(
            reminderDate,
            'やること候補があります'
          );
          console.log('✅ リマインダー設定:', processedData.suggestedTime);
        }
      }

      // メモを保存
      await saveNewMemo(notificationId);

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
          onToggleMemoStatus={handleToggleMemoStatus}
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
          onComplete={handleCompleteFinish}
        />
      )}
    </>
  );
}

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
  summary: string;
  category: string;
  suggestedTime: string;
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
          summary: response.data.summary,
          category: response.data.category,
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
        summary: processedData.summary,
        category: processedData.category as any,
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
      } else if (newStatus === 'open' && memo.notificationId) {
        // 未完了に戻す → 通知を再スケジュール（未来の時刻のみ）
        const reminderDate = new Date(memo.suggestedTime);
        if (reminderDate > new Date()) {
          await notificationService.scheduleNotification(
            reminderDate,
            memo.summary
          );
        }
      }

      await loadMemos();
    } catch (error) {
      console.error('❌ ステータス変更エラー:', error);
      Alert.alert('エラー', 'ステータスの変更に失敗しました');
    }
  };

  // リマインダー設定
  const handleSetReminder = async () => {
    if (!processedData?.suggestedTime) return;

    try {
      const reminderDate = new Date(processedData.suggestedTime);

      // 過去の時刻チェック
      if (reminderDate <= new Date()) {
        console.warn('提案された時刻が過去のため、リマインダーをスキップします');

        // メモは保存（通知なし）
        await saveNewMemo(null);

        Alert.alert(
          '通知設定',
          '提案された時刻が既に過ぎているため、通知は設定されませんでした。',
          [{ text: 'OK', onPress: () => {
            setCurrentScreen('home');
            setProcessedData(null);
            setRecordingUri(null);
          }}]
        );
        return;
      }

      const notificationId = await notificationService.scheduleNotification(
        reminderDate,
        processedData.summary
      );

      // メモを保存
      await saveNewMemo(notificationId);

      console.log('リマインダー設定:', processedData.suggestedTime);
      Alert.alert('設定完了', 'リマインダーを設定しました');
      setCurrentScreen('home');
      setProcessedData(null);
      setRecordingUri(null);
    } catch (error: any) {
      console.error('リマインダー設定エラー:', error);
      const errorMessage = error.message || '通知の設定に失敗しました';
      Alert.alert('エラー', errorMessage);
    }
  };

  // リマインダースキップ
  const handleSkipReminder = async () => {
    console.log('リマインダースキップ');

    // メモは保存（通知なし）
    await saveNewMemo(null);

    setCurrentScreen('home');
    setProcessedData(null);
    setRecordingUri(null);
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
          summary={processedData.summary}
          category={processedData.category}
          suggestedTime={processedData.suggestedTime}
          onSetReminder={handleSetReminder}
          onSkipReminder={handleSkipReminder}
        />
      )}
    </>
  );
}

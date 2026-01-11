import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import RecordingScreen from './screens/RecordingScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen from './screens/CompleteScreen';
import * as notificationService from './services/notificationService';
import * as audioRecorder from './services/audioRecorder';

type Screen = 'home' | 'recording' | 'processing' | 'complete';

interface ProcessedData {
  summary: string;
  category: string;
  suggestedTime: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // 通知権限と録音権限を取得
  useEffect(() => {
    notificationService.getPermissions();
    audioRecorder.getPermissions();
  }, []);

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

      // デモ用：2秒後に完了画面へ遷移（実際はAPI呼び出し）
      // TODO: 次のフェーズでAPI呼び出しに置き換える
      console.log('⏳ デモモード: 2秒後に完了画面へ遷移');
      setTimeout(() => {
        setProcessedData({
          summary: '企画書の締切が今日の夕方',
          category: '仕事',
          suggestedTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3時間後
        });
        setCurrentScreen('complete');
      }, 2000);
    } catch (error) {
      console.error('❌ 録音停止エラー:', error);
      Alert.alert('エラー', '録音の保存に失敗しました');
      setCurrentScreen('home');
    }
  };

  // リマインダー設定
  const handleSetReminder = async () => {
    if (!processedData?.suggestedTime) return;

    try {
      const reminderDate = new Date(processedData.suggestedTime);
      await notificationService.scheduleNotification(
        reminderDate,
        processedData.summary
      );

      console.log('リマインダー設定:', processedData.suggestedTime);
      Alert.alert('設定完了', 'リマインダーを設定しました');
      setCurrentScreen('home');
      setProcessedData(null);
      setRecordingUri(null);
    } catch (error) {
      console.error('リマインダー設定エラー:', error);
      Alert.alert('エラー', '通知の設定に失敗しました');
    }
  };

  // リマインダースキップ
  const handleSkipReminder = () => {
    console.log('リマインダースキップ');
    setCurrentScreen('home');
    setProcessedData(null);
    setRecordingUri(null);
  };

  return (
    <>
      <StatusBar style="auto" />
      {currentScreen === 'home' && (
        <HomeScreen onStartRecording={handleStartRecording} />
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

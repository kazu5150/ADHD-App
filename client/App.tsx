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

      // 実際のAPI呼び出し
      console.log('🚀 バックエンドAPIにリクエスト送信中...');
      const response = await apiClient.processVoice(uri);

      if (response.success && response.data) {
        console.log('✅ AI整理完了:', response.data);
        setProcessedData({
          summary: response.data.summary,
          category: response.data.category,
          suggestedTime: response.data.suggestedTime,
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

  // リマインダー設定
  const handleSetReminder = async () => {
    if (!processedData?.suggestedTime) return;

    try {
      const reminderDate = new Date(processedData.suggestedTime);

      // 過去の時刻チェック
      if (reminderDate <= new Date()) {
        console.warn('提案された時刻が過去のため、リマインダーをスキップします');
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

      await notificationService.scheduleNotification(
        reminderDate,
        processedData.summary
      );

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

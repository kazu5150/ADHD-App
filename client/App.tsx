import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import RecordingScreen from './screens/RecordingScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen from './screens/CompleteScreen';

type Screen = 'home' | 'recording' | 'processing' | 'complete';

interface ProcessedData {
  summary: string;
  category: string;
  suggestedTime: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  // 録音開始
  const handleStartRecording = () => {
    console.log('録音開始');
    setCurrentScreen('recording');
  };

  // 録音停止 → AI処理へ
  const handleStopRecording = () => {
    console.log('録音停止 → AI処理開始');
    setCurrentScreen('processing');

    // デモ用：2秒後に完了画面へ遷移（実際はAPI呼び出し）
    setTimeout(() => {
      setProcessedData({
        summary: '企画書の締切が今日の夕方',
        category: '仕事',
        suggestedTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3時間後
      });
      setCurrentScreen('complete');
    }, 2000);
  };

  // リマインダー設定
  const handleSetReminder = () => {
    console.log('リマインダー設定:', processedData?.suggestedTime);
    alert('リマインダーを設定しました');
    setCurrentScreen('home');
    setProcessedData(null);
  };

  // リマインダースキップ
  const handleSkipReminder = () => {
    console.log('リマインダースキップ');
    setCurrentScreen('home');
    setProcessedData(null);
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

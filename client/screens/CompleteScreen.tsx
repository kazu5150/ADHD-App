import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

interface CompleteScreenProps {
  organizedContent: string;  // Markdown形式
  hasReminder: boolean;
  suggestedTime?: string;
  onComplete: () => void;    // 自動遷移用
}

export default function CompleteScreen({
  organizedContent,
  hasReminder,
  suggestedTime,
  onComplete,
}: CompleteScreenProps) {
  // 2秒後に自動遷移
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // 時刻を読みやすい形式に変換
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.title}>預かりました</Text>
          <Text style={styles.subtitle}>もう考えなくて大丈夫です</Text>
        </View>

        {/* Markdown表示（スクロール可能） */}
        <ScrollView style={styles.markdownContainer} contentContainerStyle={styles.markdownContent}>
          <Text style={styles.markdown}>{organizedContent}</Text>
        </ScrollView>

        {/* リマインド表示（📌ありの場合のみ） */}
        {hasReminder && suggestedTime && (
          <View style={styles.reminderHint}>
            <Text style={styles.reminderText}>
              {formatTime(suggestedTime)}にリマインドします
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 48,
    color: colors.text,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  markdownContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  markdownContent: {
    paddingBottom: 20,
  },
  markdown: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  reminderHint: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 24,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  reminderText: {
    fontSize: 14,
    color: colors.text,
  },
});

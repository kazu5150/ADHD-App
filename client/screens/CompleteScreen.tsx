import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MessageCard from '../components/MessageCard';
import { colors } from '../constants/colors';

interface CompleteScreenProps {
  summary: string;
  category: string;
  suggestedTime?: string;
  onSetReminder: () => void;
  onSkipReminder: () => void;
}

export default function CompleteScreen({
  summary,
  category,
  suggestedTime,
  onSetReminder,
  onSkipReminder,
}: CompleteScreenProps) {
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

        <View style={styles.cardContainer}>
          <MessageCard title={summary} category={category} />
        </View>

        {suggestedTime && (
          <View style={styles.reminderContainer}>
            <Text style={styles.reminderQuestion}>思い出しますか？</Text>
            <Text style={styles.reminderTime}>{formatTime(suggestedTime)}</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.buttonYes} onPress={onSetReminder}>
                <Text style={styles.buttonYesText}>はい</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonNo} onPress={onSkipReminder}>
                <Text style={styles.buttonNoText}>いいえ</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 40,
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
  cardContainer: {
    marginBottom: 40,
  },
  reminderContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  reminderQuestion: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  reminderTime: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  buttonYes: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  buttonYesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonNo: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  buttonNoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
});

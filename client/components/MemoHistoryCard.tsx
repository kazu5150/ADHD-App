import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Memo } from '../types/memo';
import { colors } from '../constants/colors';

interface MemoHistoryCardProps {
  memo: Memo;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function MemoHistoryCard({
  memo,
  onToggleStatus,
  onEdit
}: MemoHistoryCardProps) {
  const isDone = memo.status === 'done';

  // 時刻を読みやすい形式にフォーマット
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (targetDay.getTime() === today.getTime()) {
      return `今日 ${timeStr}`;
    } else if (targetDay.getTime() === tomorrow.getTime()) {
      return `明日 ${timeStr}`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day} ${timeStr}`;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onEdit(memo.id)}
    >
      <View style={[
        styles.card,
        isDone && styles.cardDone
      ]}>
      {/* 左側: 要約と時刻 */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.summary,
            isDone && styles.summaryDone
          ]}
          numberOfLines={1}
        >
          {memo.summary}
        </Text>
        <Text
          style={[
            styles.timeText,
            isDone && styles.timeTextDone
          ]}
        >
          {formatTime(memo.suggestedTime)}
        </Text>
      </View>

      {/* カテゴリバッジ */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{memo.category}</Text>
      </View>

      {/* 完了ボタン */}
      <TouchableOpacity
        style={[
          styles.checkButton,
          isDone && styles.checkButtonDone
        ]}
        onPress={() => onToggleStatus(memo.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.checkIcon,
          isDone && styles.checkIconDone
        ]}>
          {isDone ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDone: {
    backgroundColor: '#FAFAFA',
    opacity: 0.6,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  summary: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  summaryDone: {
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  timeText: {
    fontSize: 11,
    color: colors.textLight,
  },
  timeTextDone: {
    color: colors.textLight,
    opacity: 0.6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.record,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonDone: {
    backgroundColor: colors.record,
    borderColor: colors.record,
  },
  checkIcon: {
    fontSize: 18,
    color: colors.record,
    fontWeight: 'bold',
  },
  checkIconDone: {
    color: colors.background,
  },
});

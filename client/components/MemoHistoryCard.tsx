import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Memo } from '../types/memo';
import { colors } from '../constants/colors';

interface MemoHistoryCardProps {
  memo: Memo;
  onToggleStatus: (id: string) => void;
}

export default function MemoHistoryCard({
  memo,
  onToggleStatus
}: MemoHistoryCardProps) {
  const isDone = memo.status === 'done';

  return (
    <View style={[
      styles.card,
      isDone && styles.cardDone
    ]}>
      {/* 要約（1行） */}
      <Text
        style={[
          styles.summary,
          isDone && styles.summaryDone
        ]}
        numberOfLines={1}
      >
        {memo.summary}
      </Text>

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
  summary: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  summaryDone: {
    color: colors.textLight,
    textDecorationLine: 'line-through',
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

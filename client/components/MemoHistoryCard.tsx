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

  // organizedContentから最初の有効な行を取得
  const getSummaryLine = (): string => {
    // organizedContentが存在しない場合はtranscriptから取得
    if (!memo.organizedContent) {
      if (memo.transcript) {
        return memo.transcript.substring(0, 30) + '...';
      }
      return 'メモがありません';
    }

    const lines = memo.organizedContent.split('\n').filter(line => line.trim());
    // "これは仮の整理です。" 以降の最初の有効な行を取得
    const startIndex = lines.findIndex(line => line.includes('これは仮の整理です'));
    const validLines = lines.slice(startIndex + 1).filter(line =>
      line.trim() && !line.startsWith('🧠') && !line.startsWith('😟') &&
      !line.startsWith('📌') && !line.startsWith('🗑')
    );

    if (validLines.length > 0) {
      return validLines[0].replace(/^・/, '').trim();
    }

    if (memo.transcript) {
      return memo.transcript.substring(0, 30) + '...';
    }
    return 'メモがありません';
  };

  // 時刻を読みやすい形式にフォーマット
  const formatTime = (dateString?: string): string => {
    if (!dateString) return '時刻未設定';

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
          numberOfLines={2}
        >
          {getSummaryLine()}
        </Text>
        {memo.hasReminder && memo.suggestedTime && (
          <Text
            style={[
              styles.timeText,
              isDone && styles.timeTextDone
            ]}
          >
            {formatTime(memo.suggestedTime)}
          </Text>
        )}
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

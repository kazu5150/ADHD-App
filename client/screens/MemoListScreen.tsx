import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MemoHistoryCard from '../components/MemoHistoryCard';
import { Memo } from '../types/memo';
import { colors } from '../constants/colors';

interface MemoListScreenProps {
  memos: Memo[];
  onToggleMemoStatus: (id: string) => void;
  onEditMemo: (memo: Memo) => void;
  onBack: () => void;
}

export default function MemoListScreen({
  memos,
  onToggleMemoStatus,
  onEditMemo,
  onBack,
}: MemoListScreenProps) {
  // 未完了と完了を分ける
  const openMemos = memos.filter(m => m.status === 'open');
  const doneMemos = memos.filter(m => m.status === 'done');

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>預けた思考</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 未完了セクション */}
        {openMemos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              未完了 ({openMemos.length})
            </Text>
            {openMemos.map(memo => (
              <MemoHistoryCard
                key={memo.id}
                memo={memo}
                onToggleStatus={onToggleMemoStatus}
                onPress={onEditMemo}
              />
            ))}
          </View>
        )}

        {/* 完了セクション */}
        {doneMemos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              完了 ({doneMemos.length})
            </Text>
            {doneMemos.map(memo => (
              <MemoHistoryCard
                key={memo.id}
                memo={memo}
                onToggleStatus={onToggleMemoStatus}
                onPress={onEditMemo}
              />
            ))}
          </View>
        )}

        {/* メモがない場合 */}
        {memos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              まだ何も預けていません
            </Text>
            <Text style={styles.emptySubtext}>
              録音ボタンを押して思考を預けましょう
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.textLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textLight,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.7,
  },
});

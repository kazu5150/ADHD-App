import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import RecordButton from '../components/RecordButton';
import MemoHistoryCard from '../components/MemoHistoryCard';
import { Memo } from '../types/memo';
import { colors } from '../constants/colors';

interface HomeScreenProps {
  onStartRecording: () => void;
  memos: Memo[];
  onToggleMemoStatus: (id: string) => void;
}

export default function HomeScreen({
  onStartRecording,
  memos,
  onToggleMemoStatus
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            まとまってなくていいので、{'\n'}今の頭の中を話してください
          </Text>
        </View>

        <View style={styles.recordButtonContainer}>
          <RecordButton onPress={onStartRecording} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>タップして思考を預ける</Text>
        </View>

        {/* メモ履歴（下部に小さく表示） */}
        {memos.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>預けた思考</Text>
            <ScrollView
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
            >
              {memos.map(memo => (
                <MemoHistoryCard
                  key={memo.id}
                  memo={memo}
                  onToggleStatus={onToggleMemoStatus}
                />
              ))}
            </ScrollView>
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
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: '400',
  },
  recordButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  hint: {
    fontSize: 14,
    color: colors.textLight,
  },
  historyContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyTitle: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 12,
    marginHorizontal: 20,
    fontWeight: '500',
  },
  historyList: {
    maxHeight: 200,
  },
});

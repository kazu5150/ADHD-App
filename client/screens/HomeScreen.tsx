import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import RecordButton from '../components/RecordButton';
import { Memo } from '../types/memo';
import { colors } from '../constants/colors';

interface HomeScreenProps {
  onStartRecording: () => void;
  memos: Memo[];
  onOpenMemoList: () => void;
}

export default function HomeScreen({
  onStartRecording,
  memos,
  onOpenMemoList,
}: HomeScreenProps) {
  // 未完了のメモ数
  const openCount = memos.filter(m => m.status === 'open').length;

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

          {/* 一覧へのリンク（目立たない場所に配置） */}
          {memos.length > 0 && (
            <TouchableOpacity
              style={styles.listLink}
              onPress={onOpenMemoList}
              activeOpacity={0.6}
            >
              <Text style={styles.listLinkText}>
                預けた思考を確認する
                {openCount > 0 && ` (${openCount})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    textAlign: 'center',
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
  listLink: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  listLinkText: {
    fontSize: 13,
    color: colors.textLight,
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});

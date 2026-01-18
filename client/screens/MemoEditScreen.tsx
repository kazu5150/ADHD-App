import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Memo } from '../types/memo';
import { colors } from '../constants/colors';

interface MemoEditScreenProps {
  memo: Memo;
  onSave: (updatedMemo: Memo) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export default function MemoEditScreen({
  memo,
  onSave,
  onDelete,
  onBack,
}: MemoEditScreenProps) {
  const [editedTranscript, setEditedTranscript] = useState(memo.transcript);
  const [editedTime, setEditedTime] = useState<Date | null>(
    memo.suggestedTime ? new Date(memo.suggestedTime) : null
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 保存ボタン押下
  const handleSave = () => {
    const updatedMemo: Memo = {
      ...memo,
      transcript: editedTranscript,
      suggestedTime: editedTime?.toISOString(),
    };
    onSave(updatedMemo);
  };

  // 削除確認
  const handleDelete = () => {
    Alert.alert(
      '削除の確認',
      'このメモを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => onDelete(memo.id),
        },
      ]
    );
  };

  // 時刻を読みやすい形式に変換
  const formatTime = (date: Date | null) => {
    if (!date) return '未設定';
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

  // DateTimePickerの変更ハンドラ
  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setEditedTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.title}>編集</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>削除</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI整理結果（読み取り専用） */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AIの整理結果</Text>
            <View style={styles.markdownContainer}>
              <Text style={styles.markdown}>{memo.organizedContent}</Text>
            </View>
          </View>

          {/* 録音内容（編集可能） */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>内容</Text>
            <TextInput
              style={styles.textInput}
              value={editedTranscript}
              onChangeText={setEditedTranscript}
              multiline
              placeholder="内容を編集..."
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* リマインド時間（編集可能） */}
          {memo.hasReminder && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>リマインド時刻</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.timeButtonText}>
                  {formatTime(editedTime)}
                </Text>
                <Text style={styles.timeButtonHint}>タップして変更</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={editedTime || new Date()}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  minimumDate={new Date()}
                  locale="ja-JP"
                />
              )}

              {Platform.OS === 'ios' && showTimePicker && (
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.pickerDoneText}>決定</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ステータス表示 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ステータス</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {memo.status === 'done' ? '✓ 完了' : '○ 未完了'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 保存ボタン */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  deleteButton: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  deleteText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
  },
  markdownContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markdown: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  timeButtonHint: {
    fontSize: 12,
    color: colors.textLight,
  },
  pickerDoneButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.record,
  },
  statusContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: colors.record,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
});

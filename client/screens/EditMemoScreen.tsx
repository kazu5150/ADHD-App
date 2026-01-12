import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Memo, MemoCategory } from '../types/memo';
import { colors } from '../constants/colors';

interface EditMemoScreenProps {
  memo: Memo;
  onSave: (updatedMemo: Memo) => void;
  onCancel: () => void;
}

const CATEGORIES: MemoCategory[] = ['仕事', '生活', 'アイデア', '不安・気がかり'];

export default function EditMemoScreen({
  memo,
  onSave,
  onCancel,
}: EditMemoScreenProps) {
  const [transcript, setTranscript] = useState(memo.transcript);
  const [summary, setSummary] = useState(memo.summary);
  const [category, setCategory] = useState<MemoCategory>(memo.category);

  const handleSave = () => {
    const updatedMemo: Memo = {
      ...memo,
      transcript,
      summary,
      category,
    };
    onSave(updatedMemo);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <Text style={styles.title}>メモを編集</Text>
            </View>

            {/* 文字起こし全文 */}
            <View style={styles.section}>
              <Text style={styles.label}>文字起こし</Text>
              <TextInput
                style={styles.textInputMultiline}
                value={transcript}
                onChangeText={setTranscript}
                multiline
                numberOfLines={6}
                placeholder="音声認識結果"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* 要約 */}
            <View style={styles.section}>
              <Text style={styles.label}>要約</Text>
              <TextInput
                style={styles.textInput}
                value={summary}
                onChangeText={setSummary}
                placeholder="1行で要約"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* カテゴリ選択 */}
            <View style={styles.section}>
              <Text style={styles.label}>カテゴリ</Text>
              <View style={styles.categoryButtons}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ボタン */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInputMultiline: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.record,
    borderColor: colors.record,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.background,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.record,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});

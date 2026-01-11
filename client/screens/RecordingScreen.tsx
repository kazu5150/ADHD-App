import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import RecordButton from '../components/RecordButton';
import { colors } from '../constants/colors';

interface RecordingScreenProps {
  onStopRecording: () => void;
}

export default function RecordingScreen({ onStopRecording }: RecordingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.status}>録音中...</Text>
        </View>

        <View style={styles.recordButtonContainer}>
          <RecordButton onPress={onStopRecording} isRecording={true} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>タップして停止</Text>
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
  status: {
    fontSize: 18,
    color: colors.record,
    fontWeight: '600',
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
});

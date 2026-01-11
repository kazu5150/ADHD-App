import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import RecordButton from '../components/RecordButton';
import { colors } from '../constants/colors';

interface HomeScreenProps {
  onStartRecording: () => void;
}

export default function HomeScreen({ onStartRecording }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>今日はもう大丈夫</Text>
        </View>

        <View style={styles.recordButtonContainer}>
          <RecordButton onPress={onStartRecording} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>タップして思考を預ける</Text>
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

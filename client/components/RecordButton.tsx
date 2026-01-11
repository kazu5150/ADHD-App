import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

interface RecordButtonProps {
  onPress: () => void;
  isRecording?: boolean;
  disabled?: boolean;
}

export default function RecordButton({ onPress, isRecording = false, disabled = false }: RecordButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isRecording && styles.recording,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>
        {isRecording ? '● 録音中' : '録音する'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.record,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recording: {
    backgroundColor: colors.recordActive,
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

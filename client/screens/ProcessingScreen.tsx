import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import LoadingIndicator from '../components/LoadingIndicator';
import { colors } from '../constants/colors';

export default function ProcessingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LoadingIndicator message="整理中です..." />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

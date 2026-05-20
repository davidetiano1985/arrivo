import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from './theme';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Caricamento...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.highlight} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});

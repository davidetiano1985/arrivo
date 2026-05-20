import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from './theme';

type StatusLevel = 'ok' | 'warning' | 'error' | 'info';

interface Props {
  level: StatusLevel;
  label: string;
  small?: boolean;
}

const indicators: Record<StatusLevel, { color: string; icon: string }> = {
  ok: { color: colors.success, icon: '🟢' },
  warning: { color: colors.warning, icon: '🟡' },
  error: { color: colors.error, icon: '🔴' },
  info: { color: colors.info, icon: '🔵' },
};

export function StatusBadge({ level, label, small }: Props) {
  const cfg = indicators[level];
  return (
    <View style={[styles.badge, { borderColor: cfg.color }, small && styles.small]}>
      <Text style={styles.icon}>{cfg.icon}</Text>
      <Text style={[styles.label, { color: cfg.color }, small && styles.labelSmall]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 10,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 10,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'neutral' | 'danger';
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.container, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  neutral: {
    backgroundColor: '#f1f5f9',
  },
  neutralText: {
    color: '#475569',
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  successText: {
    color: '#166534',
  },
  warning: {
    backgroundColor: '#fef9c3',
  },
  warningText: {
    color: '#854d0e',
  },
  danger: {
    backgroundColor: '#fee2e2',
  },
  dangerText: {
    color: '#991b1b',
  },
});

// Componente Badge para estados
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface POSBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const POSBadge: React.FC<POSBadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
}) => {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${size}`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  
  // Variantes
  badge_success: {
    backgroundColor: '#D4EDDA',
  },
  badge_warning: {
    backgroundColor: '#FFF3CD',
  },
  badge_danger: {
    backgroundColor: '#F8D7DA',
  },
  badge_info: {
    backgroundColor: '#D1ECF1',
  },
  badge_default: {
    backgroundColor: '#E9ECEF',
  },
  
  // Tamaños
  badge_small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  // Texto
  text: {
    fontWeight: '600',
  },
  text_small: {
    fontSize: 10,
  },
  text_medium: {
    fontSize: 12,
  },
});

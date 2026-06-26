// Componente de botón reutilizable para el POS
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface POSButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const POSButton: React.FC<POSButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
    fullWidth && styles.button_fullWidth,
    style,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Variantes de color
  button_primary: {
    backgroundColor: '#007AFF',
  },
  button_secondary: {
    backgroundColor: '#6C757D',
  },
  button_success: {
    backgroundColor: '#28A745',
  },
  button_danger: {
    backgroundColor: '#DC3545',
  },
  button_warning: {
    backgroundColor: '#FFC107',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  
  // Tamaños
  button_small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  button_medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  button_large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  
  // Estados
  button_disabled: {
    opacity: 0.5,
  },
  button_fullWidth: {
    width: '100%',
  },
  
  // Textos
  text: {
    fontWeight: '600',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_success: {
    color: '#FFFFFF',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_warning: {
    color: '#000000',
  },
  text_outline: {
    color: '#007AFF',
  },
  text_small: {
    fontSize: 12,
  },
  text_medium: {
    fontSize: 14,
  },
  text_large: {
    fontSize: 16,
  },
});

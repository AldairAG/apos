// Componente de icono reutilizable
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

interface POSIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const POSIcon: React.FC<POSIconProps> = ({
  name,
  size = 24,
  color = '#000000',
  style,
}) => {
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

// Colores predefinidos del sistema
export const COLORS = {
  primary: '#007AFF',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
  white: '#FFFFFF',
  black: '#000000',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#DEE2E6',
};

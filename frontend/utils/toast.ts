import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Éxito',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Información',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
};

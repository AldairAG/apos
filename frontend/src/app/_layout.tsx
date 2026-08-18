import { persistor, store } from '@/store';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="admin_home" />
          </Stack>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

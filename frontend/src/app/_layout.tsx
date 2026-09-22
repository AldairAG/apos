import { persistor, store } from '@/store';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import "../global.css";
import { ROUTES } from '@/routes/routes';

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
            <Stack.Screen name={ROUTES.LOGIN} />
            <Stack.Screen name={ROUTES.REGISTER} />
            <Stack.Screen name={ROUTES.ADMIN.HOME} />
            <Stack.Screen name={ROUTES.ADMIN.MOVIMIENTOS.CREAR_INGRESO} />
            <Stack.Screen name={ROUTES.ADMIN.MOVIMIENTOS.CREAR_GASTO} />
            <Stack.Screen name={ROUTES.SUCURSAL.HOME} />
            <Stack.Screen name={ROUTES.ADMIN.RECETAS.PANEL} />
            <Stack.Screen name={ROUTES.ADMIN.MATERIALES.PANEL} />
            <Stack.Screen name={ROUTES.ADMIN.MODIFICADORES.PANEL} />
            <Stack.Screen name={ROUTES.ADMIN.MODIFICADORES.CREAR} />
          </Stack>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

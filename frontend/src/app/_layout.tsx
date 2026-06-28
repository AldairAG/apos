import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { store, persistor } from '@/store';
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
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="perfil" />

            {/* Administración */}
            <Stack.Screen name="admin/usuarios" />
            <Stack.Screen name="admin/empleados" />
            <Stack.Screen name="admin/roles" />
            <Stack.Screen name="admin/sucursales" />

            {/* Configuración */}
            <Stack.Screen name="config/mesas" />
            <Stack.Screen name="config/categorias" />
            <Stack.Screen name="config/cajas" />

            {/* Productos y Menú */}
            <Stack.Screen name="productos/productos" />
            <Stack.Screen name="productos/extras" />
            <Stack.Screen name="productos/recetas" />

            {/* Inventario */}
            <Stack.Screen name="inventario/materiales" />
            <Stack.Screen name="inventario/existencias" />
            <Stack.Screen name="inventario/compras" />
            <Stack.Screen name="inventario/produccion" />

            {/* Punto de Venta */}
            <Stack.Screen name="pos/vista-mesas" />
            <Stack.Screen name="pos/crear-orden" />
            <Stack.Screen name="pos/ordenes" />
            <Stack.Screen name="pos/detalle-orden" />
            <Stack.Screen name="pos/cocina" />
            <Stack.Screen name="pos/home" />

            {/* Gestión de Caja */}
            <Stack.Screen name="caja/apertura" />
            <Stack.Screen name="caja/cobro" />
            <Stack.Screen name="caja/movimientos" />
            <Stack.Screen name="caja/cierre" />
            <Stack.Screen name="caja/gastos" />

            {/* Reportes */}
            <Stack.Screen name="reportes/ventas" />
            <Stack.Screen name="reportes/inventario" />
            <Stack.Screen name="reportes/gastos" />
            <Stack.Screen name="reportes/cortes" />
          </Stack>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

import { useAuth } from '@/features/usuario/auth/useAuth';
import { store } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const isLoggedIn = async ()=>{
    const usuario = await AsyncStorage.getItem('usuario');
    if(usuario){
      console.log('Usuario encontrado en AsyncStorage:', JSON.parse(usuario));
    }
  }

  useEffect(() => {
    isLoggedIn();
  }, []);
  
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

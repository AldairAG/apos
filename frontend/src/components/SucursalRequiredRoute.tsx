import { useSucursal } from '@/features/sucursal/useSucursal';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProtectedRoute } from './ProtectedRoute';

interface SucursalRequiredRouteProps {
  children: ReactNode;
  requiredRoute: string;
}

/**
 * Componente que protege rutas que requieren sucursal seleccionada
 * Además de validar autenticación y permisos, valida que haya una sucursal activa
 */
export const SucursalRequiredRoute = ({
  children,
  requiredRoute,
}: SucursalRequiredRouteProps) => {
  const router = useRouter();
  const { sucursalActual } = useSucursal();

  // Si no hay sucursal seleccionada, mostrar mensaje
  if (!sucursalActual) {
    return (
      <ProtectedRoute requiredRoute={requiredRoute}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>🏢</Text>
            <Text style={styles.title}>Sucursal Requerida</Text>
            <Text style={styles.message}>
              Para acceder a este módulo debes seleccionar una sucursal primero.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Volver al Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  // Si hay sucursal, renderizar el contenido protegido
  return (
    <ProtectedRoute requiredRoute={requiredRoute}>
      {children}
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

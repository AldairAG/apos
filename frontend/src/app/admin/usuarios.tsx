import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/routes/routes';
import { StyleSheet, Text, View } from 'react-native';

export default function UsuariosScreen() {
  return (
    <ProtectedRoute requiredRoute={ROUTES.ADMIN.USUARIOS}>
      <View style={styles.container}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <Text style={styles.description}>
          Solo visible para usuarios con rol ADMINISTRADOR
        </Text>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

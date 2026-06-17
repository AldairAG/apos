import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/routes/routes';
import { StyleSheet, Text, View } from 'react-native';

export default function CocinaScreen() {
  return (
    <ProtectedRoute requiredRoute={ROUTES.POS.COCINA}>
      <View style={styles.container}>
        <Text style={styles.title}>Pantalla de Cocina</Text>
        <Text style={styles.description}>
          Visible para ADMINISTRADOR, GERENTE y COCINA
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

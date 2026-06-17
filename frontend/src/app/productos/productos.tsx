import { StyleSheet, Text, View } from 'react-native';

export default function ProductosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Productos</Text>
    </View>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

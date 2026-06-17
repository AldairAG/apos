import { StyleSheet, Text, View } from 'react-native';

export default function AperturaCajaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apertura de Caja</Text>
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

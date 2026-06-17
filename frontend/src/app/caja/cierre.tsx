import { StyleSheet, Text, View } from 'react-native';

export default function CierreCajaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cierre de Caja</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

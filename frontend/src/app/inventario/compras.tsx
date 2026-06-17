import { StyleSheet, Text, View } from 'react-native';

export default function ComprasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compras</Text>
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

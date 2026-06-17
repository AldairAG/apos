import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <Text style={styles.badge}>NUEVO NEGOCIO</Text>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Configura tu operacion en minutos y empieza a vender hoy.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nombre del negocio</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Taqueria El Buen Sabor"
              placeholderTextColor="#a6aaa8"
              style={styles.input}
            />

            <Text style={styles.label}>Correo</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="tu@negocio.com"
              placeholderTextColor="#a6aaa8"
              style={styles.input}
            />

            <Text style={styles.label}>Contrasena</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="minimo 8 caracteres"
              placeholderTextColor="#a6aaa8"
              style={styles.input}
            />

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Crear cuenta</Text>
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Ya tienes cuenta?</Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={styles.switchLink}>Inicia sesion</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 20,
  },
  brandContainer: {
    gap: 8,
  },
  badge: {
    color: '#f0f3f1',
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '800',
  },
  subtitle: {
    color: '#e3e6e5',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff8ef',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f4d8c2',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34433a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8e4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#11281d',
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#d8352a',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
  switchRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  switchText: {
    color: '#5c6d63',
    fontSize: 13,
  },
  switchLink: {
    color: '#1d7d4d',
    fontSize: 13,
    fontWeight: '700',
  },
  blobTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 160,
    backgroundColor: '#1f8f5a',
    opacity: 0.95,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 270,
    height: 270,
    borderRadius: 170,
    backgroundColor: '#e23f32',
    opacity: 0.95,
  },
});

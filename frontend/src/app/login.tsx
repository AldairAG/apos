import { Link, router } from 'expo-router';
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
    Alert,
} from 'react-native';
import { useAuth } from '@/features/usuario/auth/useAuth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { loading, error, login } = useAuth();

  const handleLogin = async () => {
    // Validaciones básicas
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    const result = await login({
      username: username.trim(),
      password,
    });

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'No se pudo iniciar sesión');
    }
  };

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
            <Text style={styles.badge}>APOS DELIVERY</Text>
            <Text style={styles.title}>Inicia sesion</Text>
            <Text style={styles.subtitle}>Controla pedidos, cocina y caja desde un solo lugar.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="tu_usuario"
              placeholderTextColor="#a6aaa8"
              style={styles.input}
              editable={!loading}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="********"
              placeholderTextColor="#a6aaa8"
              style={styles.input}
              editable={!loading}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton, 
                pressed && styles.pressed,
                loading && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Aun no tienes cuenta?</Text>
              <Link href="/register" asChild>
                <Pressable>
                  <Text style={styles.switchLink}>Registrate</Text>
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
    backgroundColor: '#11281d',
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
    color: '#e2f3e8',
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#d2ded5',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fef9f4',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f2d9ce',
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
    backgroundColor: '#e53a2d',
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
  buttonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: '#ffe5e5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 13,
    textAlign: 'center',
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
    top: -100,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 140,
    backgroundColor: '#e63e31',
    opacity: 0.95,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 160,
    backgroundColor: '#1f8f5a',
    opacity: 0.95,
  },
});

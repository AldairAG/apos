import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('pp1@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Completa usuario y contraseña para continuar.');
      return;
    }
    const result = await login({ email: username.trim(), password });
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Error al iniciar sesión', result.error || 'Verifica tus credenciales e intenta de nuevo.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Cabecera de marca ───────────────────────────────────────── */}
          <View style={styles.header}>
            {/* Círculo decorativo de fondo */}
            <View style={styles.circle} />

            <View style={styles.brandContent}>
              {/* Ícono de la app */}
              <View style={styles.logoContainer}>
                <POSIcon name="restaurant" size={40} color={COLORS.white} />
              </View>

              <POSBadge label="APOS DELIVERY" variant="success" />

              <Text style={styles.title}>Inicia sesión</Text>
              <Text style={styles.subtitle}>
                Controla pedidos, cocina y caja desde un solo lugar.
              </Text>
            </View>
          </View>

          {/* ── Formulario ──────────────────────────────────────────────── */}
          <View style={styles.formWrapper}>
            <POSCard style={styles.card} variant="elevated">

              {/* Campo usuario */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Usuario</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <POSIcon name="person" size={18} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={COLORS.textSecondary}
                    style={styles.input}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Campo contraseña */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <POSIcon name="lock-closed" size={18} color={COLORS.textSecondary} />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textSecondary}
                    style={[styles.input, styles.inputPassword]}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <POSIcon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {error && (
                <View style={styles.errorContainer}>
                  <POSIcon name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Botón principal */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.primaryButtonText}>Entrando...</Text>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Entrar</Text>
                    <POSIcon name="arrow-forward" size={18} color={COLORS.white} />
                  </View>
                )}
              </Pressable>

              {/* Registro */}
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>¿Aún no tienes cuenta?</Text>
                <Link href="/register" asChild>
                  <Pressable>
                    <Text style={styles.switchLink}>Regístrate</Text>
                  </Pressable>
                </Link>
              </View>

            </POSCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Cabecera ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 80,          // extra inferior para que la card se solape
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  // Círculo decorativo en la esquina superior derecha
  circle: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  brandContent: {
    gap: 10,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },

  // ── Formulario (card que se solapa con el header) ─────────────────────────
  formWrapper: {
    marginTop: -48,             // sube la card sobre el header
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 24,
    gap: 16,
    borderRadius: 20,
  },

  // ── Campos ────────────────────────────────────────────────────────────────
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 13,
  },
  inputPassword: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 4,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    flex: 1,
  },

  // ── Botón ─────────────────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // ── Registro ──────────────────────────────────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
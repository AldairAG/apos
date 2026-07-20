import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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

/**
 * @description
 * Cambios de diseño para la pantalla de login:
 * - Agrear opcion para redirigir a pantalla de entrar como empleado de sucursal
 * - Agregar opcion para redirigir a pantalla de recuperar contraseña
 */

// ─────────────────────────────────────────────────────────────────────────
// Paleta de alto contraste (Neo-Brutalismo + MD3)
// Colores sólidos, sin transparencias ni degradados.
// ─────────────────────────────────────────────────────────────────────────
const INK = '#111111';        // "tinta" casi negra para bordes y texto
const SURFACE = '#FFFFFF';
const BG = '#F2F1E8';         // fondo cálido neutro (evita el blanco puro plano)
const DANGER_BG = '#FFD8D8';
const SUCCESS = '#1B7A3D';

export default function LoginScreen() {
  const [username, setUsername] = useState('pp1@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [userPressed, setUserPressed] = useState(false);
  const [passPressed, setPassPressed] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const passwordRef = useRef<TextInput>(null);

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
          {/* ── Cabecera de marca: bloque sólido, sin decoración translúcida ── */}
          <View style={styles.header}>
            <View style={styles.brandContent}>
              <View style={styles.logoContainer}>
                <POSIcon name="restaurant" size={36} color={INK} />
              </View>

              <POSBadge label="APOS DELIVERY" variant="success" />

              <Text style={styles.title}>Inicia sesión</Text>
              <Text style={styles.subtitle}>
                Controla pedidos, cocina y caja desde un solo lugar.
              </Text>

              {/* Indicador de confianza — Trust Design */}
              <View style={styles.trustRow}>
                <POSIcon name="shield-checkmark" size={16} color={SUCCESS} />
                <Text style={styles.trustText}>Conexión segura y verificada</Text>
              </View>
            </View>
          </View>

          {/* ── Formulario ──────────────────────────────────────────────── */}
          <View style={styles.formWrapper}>
            {/* Bloque de sombra dura (neo-brutalismo): capa negra detrás de la card */}
            <View style={styles.cardShadowLayer}>
              <View style={styles.card}>

                {/* Campo usuario */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>USUARIO</Text>
                  <View style={[styles.inputWrapper, userPressed && styles.inputWrapperActive]}>
                    <View style={styles.inputIcon}>
                      <POSIcon name="person" size={20} color={INK} />
                    </View>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      onFocus={() => setUserPressed(true)}
                      onBlur={() => setUserPressed(false)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      placeholder="correo@ejemplo.com"
                      placeholderTextColor="#6B6B6B"
                      style={styles.input}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Campo contraseña */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>CONTRASEÑA</Text>
                  <View style={[styles.inputWrapper, passPressed && styles.inputWrapperActive]}>
                    <View style={styles.inputIcon}>
                      <POSIcon name="lock-closed" size={20} color={INK} />
                    </View>
                    <TextInput
                      ref={passwordRef}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPassPressed(true)}
                      onBlur={() => setPassPressed(false)}
                      secureTextEntry={!showPassword}
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                      placeholder="••••••••"
                      placeholderTextColor="#6B6B6B"
                      style={[styles.input, styles.inputPassword]}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.6}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <POSIcon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={INK}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error — feedback inmediato, alto contraste, sin ambigüedad */}
                {error && (
                  <View style={styles.errorContainer}>
                    <POSIcon name="alert-circle" size={20} color={INK} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Botón principal — objetivo táctil grande, feedback de presión */}
                <Pressable
                  onPressIn={() => setBtnPressed(true)}
                  onPressOut={() => setBtnPressed(false)}
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.buttonShadowLayer}
                >
                  <View
                    style={[
                      styles.primaryButton,
                      btnPressed && styles.primaryButtonPressed,
                      loading && styles.buttonDisabled,
                    ]}
                  >
                    {loading ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator color={SURFACE} />
                        <Text style={styles.primaryButtonText}>ENTRANDO...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.primaryButtonText}>ENTRAR</Text>
                        <POSIcon name="arrow-forward" size={20} color={SURFACE} />
                      </View>
                    )}
                  </View>
                </Pressable>

                {/* Nota de seguridad psicológica: qué esperar, sin sorpresas */}
                <Text style={styles.helperNote}>
                  Tus datos se usan solo para identificarte en este local.
                </Text>

                {/* Registro */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>¿Aún no tienes cuenta?</Text>
                  <Link href="/register" asChild>
                    <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.switchLink}>REGÍSTRATE</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
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
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Cabecera: color sólido plano, borde inferior marcado (sin gradientes) ──
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 4,
    borderBottomColor: INK,
  },
  brandContent: {
    gap: 10,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 3,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: SURFACE,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SURFACE,
    lineHeight: 20,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: SURFACE,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
  },

  // ── Formulario ──────────────────────────────────────────────────────────
  formWrapper: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  // Capa de sombra dura tipo neo-brutalista (offset sólido, sin blur)
  cardShadowLayer: {
    backgroundColor: INK,
    borderRadius: 20,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: INK,
    padding: 24,
    gap: 18,
    marginRight: 6,
    marginBottom: 6,
  },

  // ── Campos ────────────────────────────────────────────────────────────────
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: INK,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: INK,
    borderRadius: 12,
    backgroundColor: BG,
    paddingHorizontal: 14,
    minHeight: 56, // objetivo táctil grande (MD3 + accesibilidad)
  },
  inputWrapperActive: {
    backgroundColor: SURFACE,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    paddingVertical: 14,
  },
  inputPassword: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 6,
  },

  // ── Error: bloque sólido, sin ambigüedad ────────────────────────────────
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: DANGER_BG,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2.5,
    borderColor: INK,
  },
  errorText: {
    color: INK,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  // ── Botón: objetivo grande + feedback de presión inmediato ──────────────
  buttonShadowLayer: {
    backgroundColor: INK,
    borderRadius: 14,
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: INK,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    marginRight: 6,
    marginBottom: 6,
  },
  primaryButtonPressed: {
    marginRight: 0,
    marginBottom: 0,
    opacity: 0.92,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: SURFACE,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  helperNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
  },

  // ── Registro ──────────────────────────────────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  switchText: {
    color: '#4A4A4A',
    fontSize: 13,
    fontWeight: '600',
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});
import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
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
 * Cambios en el formulario de registro:
 * - Retirar campo de nombre de usuario (username) y usar email como identificador único.
 * - Agregar campo de nombre de usuario
 * - Agregar campo de apellidos de usuario
 * - Agregar campo de lada 
 * - Agregar confirmacion de contraseña para evitar errores tipográficos.
 * - Validar que la contraseña tenga al menos 8 caracteres.
 * - Validar que el email tenga un formato válido.
 * - Agregar feedback visual para campos requeridos y errores de validación.
 * - Agregar los campos nuevo al type de RegistroRequestDTO ubicado en auth.types.ts
 * - Agregar validación de que el nombre de usuario no contenga caracteres especiales.
 * - Agregar validación de que el nombre de usuario tenga al menos 3 caracteres.
 */

// ─────────────────────────────────────────────────────────────────────────
// Paleta de alto contraste (Neo-Brutalismo + MD3) — misma base que Login
// ─────────────────────────────────────────────────────────────────────────
const INK = '#111111';
const SURFACE = '#FFFFFF';
const BG = '#F2F1E8';
const DANGER_BG = '#FFD8D8';
const SUCCESS = '#1B7A3D';

export default function RegisterScreen() {
  const [username, setUsername] = useState('pp@gmail.com');
  const [email, setEmail] = useState('pp@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [telefono, setTelefono] = useState('5523169875');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [btnPressed, setBtnPressed] = useState(false);

  const { loading, error, registro } = useAuth();

  const handleRegistro = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !telefono.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos para continuar.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 8 caracteres.');
      return;
    }

    const result = await registro({
      username: username.trim(),
      email: email.trim(),
      password,
      telefono: telefono.trim(),
      referenciado: '',
    });

    if (result.success) {
      Alert.alert('¡Cuenta creada!', 'Tu negocio ya está listo para operar.', [
        { text: 'Continuar', onPress: () => router.replace('/') },
      ]);
    } else {
      Alert.alert('Error al registrarse', result.error || 'No se pudo crear la cuenta.');
    }
  };

  // Campo reutilizable — objetivo táctil grande, borde marcado, estado de foco visible
  const renderField = (
    key: string,
    label: string,
    icon: string,
    value: string,
    onChange: (v: string) => void,
    opts?: {
      placeholder?: string;
      keyboard?: any;
      secure?: boolean;
      capitalize?: any;
      returnKeyType?: any;
      onSubmitEditing?: () => void;
    }
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={[styles.inputWrapper, focusedField === key && styles.inputWrapperActive]}>
        <View style={styles.inputIcon}>
          <POSIcon name={icon as any} size={20} color={INK} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocusedField(key)}
          onBlur={() => setFocusedField(null)}
          placeholder={opts?.placeholder ?? ''}
          placeholderTextColor="#6B6B6B"
          keyboardType={opts?.keyboard ?? 'default'}
          autoCapitalize={opts?.capitalize ?? 'sentences'}
          secureTextEntry={opts?.secure && !showPassword}
          returnKeyType={opts?.returnKeyType ?? 'next'}
          onSubmitEditing={opts?.onSubmitEditing}
          style={[styles.input, opts?.secure && styles.inputPassword]}
          editable={!loading}
        />
        {opts?.secure && (
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
        )}
      </View>
    </View>
  );

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
          {/* ── Cabecera: bloque sólido, sin círculos translúcidos ─────── */}
          <View style={styles.header}>
            <View style={styles.brandContent}>
              <View style={styles.logoContainer}>
                <POSIcon name="storefront" size={36} color={INK} />
              </View>

              <POSBadge label="NUEVO NEGOCIO" variant="success" />

              <Text style={styles.title}>Crea tu cuenta</Text>
              <Text style={styles.subtitle}>
                Configura tu operación en minutos y empieza a vender hoy.
              </Text>

              {/* Trust Design */}
              <View style={styles.trustRow}>
                <POSIcon name="shield-checkmark" size={16} color={SUCCESS} />
                <Text style={styles.trustText}>Registro seguro y sin costo</Text>
              </View>
            </View>
          </View>

          {/* ── Formulario ───────────────────────────────────────────── */}
          <View style={styles.formWrapper}>
            <View style={styles.cardShadowLayer}>
              <View style={styles.card}>

                {renderField(
                  'username',
                  'Nombre de usuario',
                  'person',
                  username,
                  setUsername,
                  { placeholder: 'Taquería El Buen Sabor' }
                )}

                {renderField(
                  'email',
                  'Correo',
                  'mail',
                  email,
                  setEmail,
                  { placeholder: 'tu@negocio.com', keyboard: 'email-address', capitalize: 'none' }
                )}

                {renderField(
                  'telefono',
                  'Teléfono',
                  'call',
                  telefono,
                  setTelefono,
                  { placeholder: '5551234567', keyboard: 'phone-pad', capitalize: 'none' }
                )}

                {renderField(
                  'password',
                  'Contraseña',
                  'lock-closed',
                  password,
                  setPassword,
                  {
                    placeholder: 'Mínimo 8 caracteres',
                    secure: true,
                    capitalize: 'none',
                    returnKeyType: 'go',
                    onSubmitEditing: handleRegistro,
                  }
                )}

                {/* Error — bloque sólido, alto contraste */}
                {error && (
                  <View style={styles.errorContainer}>
                    <POSIcon name="alert-circle" size={20} color={INK} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Botón — feedback de presión inmediato */}
                <Pressable
                  onPressIn={() => setBtnPressed(true)}
                  onPressOut={() => setBtnPressed(false)}
                  onPress={handleRegistro}
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
                        <Text style={styles.primaryButtonText}>CREANDO CUENTA...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.primaryButtonText}>CREAR CUENTA</Text>
                        <POSIcon name="arrow-forward" size={20} color={SURFACE} />
                      </View>
                    )}
                  </View>
                </Pressable>

                {/* Seguridad psicológica: qué pasa después, sin sorpresas */}
                <Text style={styles.helperNote}>
                  Tu contraseña se guarda cifrada. Puedes cambiarla cuando quieras.
                </Text>

                {/* Link a login */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>¿Ya tienes cuenta?</Text>
                  <Link href="/login" asChild>
                    <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.switchLink}>INICIA SESIÓN</Text>
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

  // ── Cabecera: color sólido plano, borde inferior marcado ────────────────
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

  // ── Formulario ────────────────────────────────────────────────────────────
  formWrapper: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
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
    gap: 16,
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
    minHeight: 56,
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

  // ── Error ─────────────────────────────────────────────────────────────────
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

  // ── Botón ─────────────────────────────────────────────────────────────────
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

  // ── Link a login ────────────────────────────────────────────────────────
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
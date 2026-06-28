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

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  // Campo reutilizable
  const renderField = (
    label: string,
    icon: string,
    value: string,
    onChange: (v: string) => void,
    opts?: {
      placeholder?: string;
      keyboard?: any;
      secure?: boolean;
      capitalize?: any;
    }
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <POSIcon name={icon as any} size={18} color={COLORS.textSecondary} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={opts?.placeholder ?? ''}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType={opts?.keyboard ?? 'default'}
          autoCapitalize={opts?.capitalize ?? 'sentences'}
          secureTextEntry={opts?.secure && !showPassword}
          style={[styles.input, opts?.secure && styles.inputPassword]}
          editable={!loading}
        />
        {opts?.secure && (
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
          {/* ── Cabecera ─────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.circleTopRight} />
            <View style={styles.circleBottomLeft} />

            <View style={styles.brandContent}>
              <View style={styles.logoContainer}>
                <POSIcon name="storefront" size={40} color={COLORS.white} />
              </View>

              <POSBadge label="NUEVO NEGOCIO" variant="success" />

              <Text style={styles.title}>Crea tu cuenta</Text>
              <Text style={styles.subtitle}>
                Configura tu operación en minutos y empieza a vender hoy.
              </Text>
            </View>
          </View>

          {/* ── Formulario ───────────────────────────────────────────── */}
          <View style={styles.formWrapper}>
            <POSCard style={styles.card} variant="elevated">

              {renderField(
                'Nombre de usuario',
                'person',
                username,
                setUsername,
                { placeholder: 'Taquería El Buen Sabor' }
              )}

              {renderField(
                'Correo',
                'mail',
                email,
                setEmail,
                { placeholder: 'tu@negocio.com', keyboard: 'email-address', capitalize: 'none' }
              )}

              {renderField(
                'Teléfono',
                'call',
                telefono,
                setTelefono,
                { placeholder: '5551234567', keyboard: 'phone-pad', capitalize: 'none' }
              )}

              {renderField(
                'Contraseña',
                'lock-closed',
                password,
                setPassword,
                { placeholder: 'Mínimo 8 caracteres', secure: true, capitalize: 'none' }
              )}

              {/* Error */}
              {error && (
                <View style={styles.errorContainer}>
                  <POSIcon name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Botón */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleRegistro}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.primaryButtonText}>Creando cuenta...</Text>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                    <POSIcon name="arrow-forward" size={18} color={COLORS.white} />
                  </View>
                )}
              </Pressable>

              {/* Link a login */}
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>¿Ya tienes cuenta?</Text>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text style={styles.switchLink}>Inicia sesión</Text>
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
    paddingBottom: 80,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  circleTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
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

  // ── Formulario ────────────────────────────────────────────────────────────
  formWrapper: {
    marginTop: -48,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 24,
    gap: 14,
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
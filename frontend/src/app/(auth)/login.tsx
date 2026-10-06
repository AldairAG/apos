import { useAuth } from '@/features/usuario/auth/presentation/hook/useAuth';
import { Ionicons } from '@expo/vector-icons';
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
    Text,
    TextInput,
    View,
} from 'react-native';

/**
 * TODO[AUTH]: Pendiente de implementar (no se tocó en este rediseño):
 * - Agregar opción para redirigir a pantalla de entrar como empleado de sucursal
 * - Agregar opción para redirigir a pantalla de recuperar contraseña
 *
 * Rediseño a Material Design 3 con NativeWind (sin react-native-paper):
 * paleta MD3 (#1857B6 primario, #E7E0EC bordes, #B3261E error), inputs
 * outlined con estado de foco, botón pill, mismos componentes nativos de
 * React Native. La lógica de autenticación (useAuth, validaciones,
 * navegación) es exactamente la misma que ya tenías.
 */

export default function LoginScreen() {
  const [username, setUsername] = useState('pp1@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

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
    <SafeAreaView className="flex-1 bg-[#FAF9FC]">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Cabecera ───────────────────────────────────────────────── */}
          <View className="bg-[#1857B6] pt-14 pb-10 px-6 rounded-b-[28px]">
            <Text className="text-3xl font-bold text-white">Inicia sesión</Text>
            <Text className="text-sm text-white/90 mt-1.5">
              Controla pedidos, cocina y caja desde un solo lugar.
            </Text>

            <View className="self-start mt-3 bg-white/15 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
              <Ionicons name="shield-checkmark-outline" size={14} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white">
                Conexión segura y verificada
              </Text>
            </View>
          </View>

          {/* ── Formulario ─────────────────────────────────────────────── */}
          <View className="px-5 -mt-6 pb-10">
            <View
              className="bg-white rounded-[28px] p-6 gap-1 border border-[#E7E0EC]"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              {/* Campo usuario */}
              <Text className="text-xs font-medium text-[#79747E] mb-1">Usuario</Text>
              <View
                className={`flex-row items-center border rounded-xl px-3 mb-4 ${
                  userFocused ? 'border-[#1857B6] border-2' : 'border-[#E7E0EC]'
                }`}
              >
                <Ionicons name="mail-outline" size={18} color="#79747E" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                  className="flex-1 text-base text-[#1C1B1F] py-3.5 ml-2"
                />
              </View>

              {/* Campo contraseña */}
              <Text className="text-xs font-medium text-[#79747E] mb-1">Contraseña</Text>
              <View
                className={`flex-row items-center border rounded-xl px-3 mb-1 ${
                  passFocused ? 'border-[#1857B6] border-2' : 'border-[#E7E0EC]'
                }`}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#79747E" />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  secureTextEntry={!showPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                  className="flex-1 text-base text-[#1C1B1F] py-3.5 ml-2"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  className="p-1.5"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#79747E"
                  />
                </Pressable>
              </View>

              {/* Error */}
              {error ? (
                <View className="flex-row items-start gap-2 bg-[#FDECEA] rounded-xl p-3 mt-3">
                  <Ionicons name="alert-circle" size={16} color="#B3261E" />
                  <Text className="flex-1 text-sm text-[#B3261E]">{error}</Text>
                </View>
              ) : (
                <View className="mt-2" />
              )}

              {/* Botón principal */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                className={`flex-row items-center justify-center gap-2 rounded-full py-4 mt-4 ${
                  loading ? 'bg-[#8FA8D1]' : 'bg-[#1857B6] active:opacity-90'
                }`}
              >
                {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
                <Text className="text-white text-base font-semibold tracking-wide">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Text>
              </Pressable>

              <Text className="text-xs text-[#79747E] text-center mt-3">
                Tus datos se usan solo para identificarte en este local.
              </Text>

              {/* Registro */}
              <View className="flex-row justify-center items-center gap-1.5 mt-4">
                <Text className="text-sm text-[#79747E]">¿Aún no tienes cuenta?</Text>
                <Link href="/register" asChild>
                  <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text className="text-sm font-semibold text-[#1857B6]">Regístrate</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
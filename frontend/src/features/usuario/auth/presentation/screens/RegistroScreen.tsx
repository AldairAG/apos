import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

// ---------------------------------------------------------------------------
// Paleta Material 3 (amarillo como primary, azul como secondary/acento)
// Puedes moverla a tailwind.config.js -> theme.extend.colors si prefieres
// referenciarla como "primary-40", "secondary-40", etc.
// ---------------------------------------------------------------------------
// primary:    #F2C200 (amarillo)
// onPrimary:  #1A1A00
// secondary:  #1E5FBF (azul)
// onSecondary:#FFFFFF
// surface:    #FFFDF6
// error:      #B3261E
// ---------------------------------------------------------------------------

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'Debe tener al menos 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: Implementar método de registro real.
      // Ejemplo de integración futura:
      //
      // const response = await authService.register({ email, password });
      // if (response.ok) { navigation.replace('Home'); }
      // else { setErrors({ email: response.errorMessage }); }
      //
      await new Promise((resolve) => setTimeout(resolve, 1200)); // simulación temporal
      console.log('Registrar usuario ->', { email, password });
    } catch (error) {
      console.error('Error al registrar usuario', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#FFFDF6]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        {/* Contenedor centrado */}
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="w-full max-w-sm">

            {/* Encabezado */}
            <View className="mb-8 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#F2C200]">
                <Text className="text-2xl font-bold text-[#1A1A00]">A</Text>
              </View>
              <Text className="text-2xl font-semibold text-[#1B1B1F]">
                Crear cuenta
              </Text>
              <Text className="mt-1 text-center text-sm text-[#49454F]">
                Regístrate con tu correo y una contraseña segura
              </Text>
            </View>

            {/* Tarjeta del formulario (Material 3 - elevated surface) */}
            <View className="rounded-3xl bg-white p-6 shadow-md">

              {/* Campo: Correo */}
              <View className="mb-5">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Correo electrónico
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="tucorreo@ejemplo.com"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`rounded-xl border px-4 py-3.5 text-base text-[#1B1B1F] ${
                    errors.email
                      ? 'border-[#B3261E] bg-[#FDECEA]'
                      : 'border-[#79747E] bg-[#FFFDF6] focus:border-[#1E5FBF]'
                  }`}
                />
                {errors.email && (
                  <Text className="mt-1 text-xs text-[#B3261E]">{errors.email}</Text>
                )}
              </View>

              {/* Campo: Contraseña */}
              <View className="mb-5">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Contraseña
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className={`rounded-xl border px-4 py-3.5 pr-16 text-base text-[#1B1B1F] ${
                      errors.password
                        ? 'border-[#B3261E] bg-[#FDECEA]'
                        : 'border-[#79747E] bg-[#FFFDF6] focus:border-[#1E5FBF]'
                    }`}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4"
                    hitSlop={8}
                  >
                    <Text className="text-xs font-semibold text-[#1E5FBF]">
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </Pressable>
                </View>
                {errors.password && (
                  <Text className="mt-1 text-xs text-[#B3261E]">{errors.password}</Text>
                )}
              </View>

              {/* Campo: Confirmar contraseña */}
              <View className="mb-6">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Confirmar contraseña
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    className={`rounded-xl border px-4 py-3.5 pr-16 text-base text-[#1B1B1F] ${
                      errors.confirmPassword
                        ? 'border-[#B3261E] bg-[#FDECEA]'
                        : 'border-[#79747E] bg-[#FFFDF6] focus:border-[#1E5FBF]'
                    }`}
                  />
                  <Pressable
                    onPress={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-4"
                    hitSlop={8}
                  >
                    <Text className="text-xs font-semibold text-[#1E5FBF]">
                      {showConfirm ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </Pressable>
                </View>
                {errors.confirmPassword && (
                  <Text className="mt-1 text-xs text-[#B3261E]">
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Botón principal (Filled Button - Material 3, color amarillo) */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                className={`items-center justify-center rounded-full bg-[#F2C200] py-4 active:opacity-80 ${
                  loading ? 'opacity-60' : ''
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#1A1A00" />
                ) : (
                  <Text className="text-base font-semibold text-[#1A1A00]">
                    Registrarme
                  </Text>
                )}
              </Pressable>

              {/* Botón secundario (Outlined Button - azul) */}
              <Pressable className="mt-3 items-center justify-center rounded-full border border-[#1E5FBF] py-4 active:bg-[#1E5FBF]/10">
                <Text className="text-base font-semibold text-[#1E5FBF]">
                  Ya tengo una cuenta
                </Text>
              </Pressable>
            </View>

            <Text className="mt-6 text-center text-xs text-[#79747E]">
              Al registrarte aceptas nuestros Términos y Política de privacidad.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
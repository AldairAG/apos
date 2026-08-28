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
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Rol } from '../../domain/types/auth.types';
import { useAuth } from '../hook/useAuth';
import { router } from 'expo-router';
import { ROUTES } from '@/routes/routes';

// ---------------------------------------------------------------------------
// Requiere: npm install react-hook-form
// ---------------------------------------------------------------------------
// Paleta Material 3 (amarillo como primary, azul como secondary/acento)
// primary:    #F2C200 (amarillo)
// onPrimary:  #1A1A00
// secondary:  #1E5FBF (azul)
// onSecondary:#FFFFFF
// surface:    #FFFDF6
// error:      #B3261E
// ---------------------------------------------------------------------------

// type UserRole = 'administrador' | 'empleado';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  rol: Rol;
};

const roleOptions: { value: Rol; label: string }[] = [
  { value: Rol.ADMINISTRADOR, label: 'Administrador' },
  { value: Rol.SIN_ROL, label: 'Empleado' },
];

export default function RegisterScreen() {
  const { registro, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      rol: Rol.SIN_ROL,
    },
    mode: 'onSubmit',
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await registro(data);

    if (result.success) {
      router.replace(ROUTES.ADMIN.HOME);
    }

    Alert.alert('Error', result.error || 'No se pudo registrar el usuario');
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

              {/* Campo: Rol (Segmented Button - Material 3) */}
              <View className="mb-5">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Tipo de usuario
                </Text>
                <Controller
                  control={control}
                  name="rol"
                  rules={{ required: 'Selecciona un rol' }}
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row overflow-hidden rounded-full border border-[#1E5FBF]">
                      {roleOptions.map((option, index) => {
                        const isSelected = value === option.value;
                        return (
                          <Pressable
                            key={option.value}
                            onPress={() => onChange(option.value)}
                            className={`flex-1 items-center justify-center py-3 ${isSelected ? 'bg-[#1E5FBF]' : 'bg-white'
                              } ${index === 0 ? 'border-r border-[#1E5FBF]' : ''}`}
                          >
                            <Text
                              className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#1E5FBF]'
                                }`}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />
                {errors.rol && (
                  <Text className="mt-1 text-xs text-[#B3261E]">
                    {errors.rol.message}
                  </Text>
                )}
              </View>

              {/* Campo: Correo */}
              <View className="mb-5">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Correo electrónico
                </Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'El correo es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Ingresa un correo válido',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="tucorreo@ejemplo.com"
                      placeholderTextColor="#9E9E9E"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className={`rounded-xl border px-4 py-3.5 text-base text-[#1B1B1F] ${errors.email
                          ? 'border-[#B3261E] bg-[#FDECEA]'
                          : 'border-[#79747E] bg-[#FFFDF6] focus:border-[#1E5FBF]'
                        }`}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="mt-1 text-xs text-[#B3261E]">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Campo: Contraseña */}
              <View className="mb-5">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Contraseña
                </Text>
                <View className="relative justify-center">
                  <Controller
                    control={control}
                    name="password"
                    rules={{
                      required: 'La contraseña es obligatoria',
                      minLength: {
                        value: 8,
                        message: 'Debe tener al menos 8 caracteres',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Mínimo 8 caracteres"
                        placeholderTextColor="#9E9E9E"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className={`rounded-xl border px-4 py-3.5 pr-16 text-base text-[#1B1B1F] ${errors.password
                            ? 'border-[#B3261E] bg-[#FDECEA]'
                            : 'border-[#79747E] bg-[#FFFDF6] focus:border-[#1E5FBF]'
                          }`}
                      />
                    )}
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
                  <Text className="mt-1 text-xs text-[#B3261E]">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Campo: Confirmar contraseña */}
              <View className="mb-6">
                <Text className="mb-1.5 text-xs font-medium text-[#1E5FBF]">
                  Confirmar contraseña
                </Text>
                <View className="relative justify-center">
                  <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{
                      required: 'Confirma tu contraseña',
                      validate: (value) =>
                        value === passwordValue || 'Las contraseñas no coinciden',
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Repite tu contraseña"
                        placeholderTextColor="#9E9E9E"
                        secureTextEntry={!showConfirm}
                        autoCapitalize="none"
                        className={`rounded-xl border px-4 py-3.5 pr-16 text-base text-[#1B1B1F] ${errors.confirmPassword
                            ? 'border-[#B3261E] bg-[#FDECEA]'
                            : 'border-[#79747E] bg-[#FFFDF6] focus:border-[#1E5FBF]'
                          }`}
                      />
                    )}
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
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>

              {/* Botón principal (Filled Button - Material 3, color amarillo) */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={`items-center justify-center rounded-full bg-[#F2C200] py-4 active:opacity-80 ${loading ? 'opacity-60' : ''
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
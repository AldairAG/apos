import { authThunks } from '@/features/auth/auth.thunks';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Yup from 'yup';

const registerSchema = Yup.object({
  email: Yup.string().email('Por favor ingresa un correo valido').required('El correo es requerido'),
  password: Yup.string()
    .min(6, 'La contrasena debe tener al menos 6 caracteres')
    .required('La contrasena es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contrasenas no coinciden')
    .required('Confirma tu contrasena'),
});

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state) => state.auth.error);
  const isDark = colorScheme === 'dark';

  const handleRegister = async (values: RegisterFormValues) => {
    const result = await dispatch(
      authThunks.register({
        email: values.email.trim(),
        password: values.password,
      })
    );

    if (result.success) {
      Alert.alert('Exito', 'Registro exitoso');
      router.back();
      return;
    }

    Alert.alert('Error', result.error || authError || 'No fue posible completar el registro');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.textDark]}>Crear Cuenta</Text>
        <Text style={[styles.subtitle, isDark && styles.textDark]}>
          Regístrate para comenzar
        </Text>

        <Formik<RegisterFormValues>
          initialValues={{ email: '', password: '', confirmPassword: '' }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Correo electronico"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Contrasena"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
              {touched.password && errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Confirmar contrasena"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
              {touched.confirmPassword && errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.registerButton]}
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Registrarse</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, isDark && styles.textDark]}>
                  ¿Ya tienes una cuenta?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>Inicia sesion</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  textDark: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
  },
});

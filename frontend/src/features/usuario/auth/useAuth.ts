import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { login, registro } from './auth.thunk';
import { logout as logoutAction } from './auth.slice';
import { Platform } from 'react-native';

import type { AuthRequest, JwtPayload, RegistroRequestDTO } from './auth.types';
import { loadFromSessionStorage, obtenerRutaSegunRol } from './auth.helpers';
import { router } from 'expo-router';
import { ROUTES } from '@/routes/routes';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Seleccionar estado con tipado correcto
  const auth = useSelector((state: RootState) => state.auth);
  const { token, loading, error, isAuthenticated } = auth;

  // Login
  const handleLogin = useCallback(
    async (credentials: AuthRequest) => {
      const result = await dispatch(login(credentials));
      if (login.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  // Registro
  const handleRegistro = useCallback(
    async (data: RegistroRequestDTO) => {
      const result = await dispatch(registro(data));
      if (registro.fulfilled.match(result)) {
        obtenerRutaSegunRol(result.payload.data.token);
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  const verificarInicioSesion = useCallback(() => {
    if (Platform.OS === 'web') {
      //loadFromSessionStorage('auth_user');
      const token = loadFromSessionStorage('auth_token');
      if (token) {
        return true;
      }
    } else {
      // Android e iOS
      //return sessionStorage.getItem('token');
    }

    return false;
  }, []);


  // Logout
  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    // Estado
    token,
    loading,
    error,
    isAuthenticated,
    // Acciones
    login: handleLogin,
    registro: handleRegistro,
    logout: handleLogout,
    verificarInicioSesion,
  };
};

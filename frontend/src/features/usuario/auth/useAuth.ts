import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, persistor, RootState } from '@/store';
import { login, registro } from './auth.thunk';
import { logout as logoutAction } from './auth.slice';
import type { AuthRequest, RegistroRequestDTO } from './auth.types';
import {obtenerRutaSegunRol } from './auth.helpers';

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
    const isLoggedIn = !!token;
    return isLoggedIn;
  }, [token]);


  // Logout
  const handleLogout = useCallback(async () => {
    dispatch(logoutAction());
      await persistor.purge();
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

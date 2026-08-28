import { AppDispatch, persistor, RootState } from '@/store';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerRutaSegunRol } from '../../infrestructure/auth.helpers';
import { loginThunk } from '../../aplication/useCase/login.thunk';
import { registroThunk } from '../../aplication/useCase/registro.thunk';
import { logout as logoutAction } from '../../store/auth.slice';
import type { AuthRequest, RegistroRequestDTO } from '../../domain/types/auth.types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Seleccionar estado con tipado correcto
  const auth = useSelector((state: RootState) => state.auth);
  const { token, loading, error, isAuthenticated } = auth;

  // Login
  const handleLogin = useCallback(
    async (credentials: AuthRequest) => {
      const result = await dispatch(loginThunk(credentials));
      if (loginThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  // Registro
  const handleRegistro = useCallback(
    async (data: RegistroRequestDTO) => {
      const result = await dispatch(registroThunk(data));
      if (registroThunk.fulfilled.match(result)) {
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

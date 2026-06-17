import { obtenerRolDesdeToken } from '@/features/usuario/auth/auth.helpers';
import { useAuth } from '@/features/usuario/auth/useAuth';
import {
    filtrarMenuPorRol,
    obtenerRutasPermitidas,
    tienePermisoParaRuta
} from '@/routes/routes';
import { useMemo } from 'react';

/**
 * Hook para manejar la navegación basada en roles
 */
export const useRoleBasedNavigation = () => {
  const { token, isAuthenticated } = useAuth();

  // Obtener el rol del token
  const rol = useMemo(() => {
    if (!token) return null;
    return obtenerRolDesdeToken(token);
  }, [token]);

  // Obtener el menú filtrado según el rol
  const menu = useMemo(() => {
    return filtrarMenuPorRol(rol);
  }, [rol]);

  // Obtener las rutas permitidas para el rol
  const rutasPermitidas = useMemo(() => {
    return obtenerRutasPermitidas(rol);
  }, [rol]);

  // Función para verificar si tiene permiso para una ruta
  const verificarPermiso = (ruta: string): boolean => {
    return tienePermisoParaRuta(rol, ruta);
  };

  return {
    rol,
    menu,
    rutasPermitidas,
    verificarPermiso,
    isAuthenticated,
  };
};

import { obtenerRolDesdeToken } from '@/features/usuario/auth/auth.helpers';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { ROUTES, tienePermisoParaRuta } from '@/routes/routes';
import { Redirect } from 'expo-router';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoute: string;
}

/**
 * Componente para proteger rutas basadas en el rol del usuario
 */
export const ProtectedRoute = ({ children, requiredRoute }: ProtectedRouteProps) => {
  const { token, isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !token) {
    return <Redirect href={ROUTES.LOGIN} />;
  }

  // Obtener el rol del token
  const rol = obtenerRolDesdeToken(token);

  // Verificar si el usuario tiene permiso para acceder a esta ruta
  if (!tienePermisoParaRuta(rol, requiredRoute)) {
    // Redirigir al dashboard si no tiene permiso
    return <Redirect href={ROUTES.DASHBOARD} />;
  }

  // Si tiene permiso, renderizar el componente
  return <>{children}</>;
};

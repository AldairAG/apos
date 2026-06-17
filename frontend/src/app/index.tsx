import { obtenerRutaSegunRol } from '@/features/usuario/auth/auth.helpers';
import { useAuth } from '@/features/usuario/auth/useAuth';
import { ROUTES } from '@/routes/routes';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { isAuthenticated, token } = useAuth();

  if (isAuthenticated && token) {
    // Si está autenticado, redirigir según su rol
    const rutaInicial = obtenerRutaSegunRol(token);
    return <Redirect href={rutaInicial} />;
  }

  // Si no está autenticado, ir al login
  return <Redirect href={ROUTES.LOGIN} />;
}

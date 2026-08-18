import { useAuth } from '@/features/usuario/auth/presentation/hook/useAuth';
import { ROUTES } from '@/routes/routes';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { verificarInicioSesion } = useAuth();

  if (verificarInicioSesion()) {
    console.log('Usuario autenticado, redirigiendo a dashboard...');
    // Si está autenticado, redirigir según su rol
    return <Redirect href={ROUTES.DASHBOARD} />;
  }
  // Si no está autenticado, ir al login
  return <Redirect href={ROUTES.LOGIN} />;
}

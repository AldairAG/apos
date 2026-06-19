import { useAuth } from '@/features/usuario/auth/useAuth';
import { ROUTES } from '@/routes/routes';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

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

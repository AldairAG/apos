/**
 * Definición de rutas de la aplicación POS
 * Basado en el mapa de navegación del sistema
 */

export const ROUTES = {
  // Autenticación
  LOGIN: '/login',
  REGISTER: '/register',
  INDEX: '/',

  // Módulo de Administración del Sistema
  ADMIN: {
    HOME: '/admin_home',
  },


} as const;

/**
 * Roles del sistema
 */
export enum Rol {
  ADMINISTRADOR = 'ROLE_ADMINISTRADOR',
  GERENTE = 'ROLE_GERENTE',
  MESERO = 'ROLE_MESERO',
  COCINA = 'ROLE_COCINA',
}

/**
 * Configuración de permisos por rol
 * Define qué rutas puede acceder cada rol
 */
export const PERMISOS_POR_ROL: Record<string, string[]> = {
  // ADMINISTRADOR: Acceso total a todas las funcionalidades
  [Rol.ADMINISTRADOR]: [
    // Administración
    ROUTES.ADMIN.HOME,
  ],

  // GERENTE: Configuración, productos, inventario y reportes (no administración de usuarios)
  [Rol.GERENTE]: [

  ],

  // MESERO: Órdenes, mesas y caja (operaciones de punto de venta)
  [Rol.MESERO]: [

    // Caja (solo cobro)
  ],

  // COCINA: Pantalla de cocina y producción
  [Rol.COCINA]: [

  ],
};

/**
 * Obtiene la ruta inicial según el rol del usuario
 */
export const obtenerRutaInicialPorRol = (rol: string | null): string => {
  if (!rol) return ROUTES.LOGIN;

  switch (rol) {
    case Rol.ADMINISTRADOR:
      return ROUTES.ADMIN.HOME;
    case Rol.GERENTE:
      return ROUTES.INDEX;
    case Rol.MESERO:
      return ROUTES.ADMIN.HOME;
    case Rol.COCINA:
      return ROUTES.ADMIN.HOME;
    default:
      return ROUTES.INDEX;
  }
};

/**
 * Verifica si un usuario tiene permiso para acceder a una ruta
 */
export const tienePermisoParaRuta = (rol: string | null, ruta: string): boolean => {
  if (!rol) return false;

  const permisosRol = PERMISOS_POR_ROL[rol];
  if (!permisosRol) return false;

  return permisosRol.includes(ruta);
};

/**
 * Obtiene todas las rutas permitidas para un rol
 */
export const obtenerRutasPermitidas = (rol: string | null): string[] => {
  if (!rol) return [];
  return PERMISOS_POR_ROL[rol] || [];
};

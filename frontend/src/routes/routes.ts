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
    MOVIMIENTOS: {
      CREAR_GASTO: '/movimientos/admin_crear_gasto',
      CREAR_INGRESO: '/movimientos/admin_crear_ingreso',
    },
    RECETAS: {
      PANEL: '/recetas/RecetasPanel',
      CREAR: '/recetas/CrearReceta',
    },
    MATERIALES: {
      PANEL: '/materiales/MaterialesPanel',
      CREAR: '/materiales/CrearMaterial',
    },
    MODIFICADORES: {
      PANEL: '/modificadores/ModificadoresPanel',
      CREAR: '/modificadores/CrearModificador',
    }
  },

  SUCURSAL: {
    HOME: '/sucursal_home',
    PRODUCTOS: 'productos',
    DASHBOARD: 'dashboard',
    CATEGORIA: 'categoria',
    INVENTARIO: 'inventario',
    CAJA: 'caja',
    MESAS: 'mesas',
    ORDENES: 'ordenes',
    CONFIGURACION: 'configuracion',

  },

  ADMIN_SUCURSAL: {
    SELECCIONAR: '/sucursal/SeleccionarSucursal',
  },

  POS: {
    HOME: '/pos_home',
  },

} as const;

/**
 * Módulos disponibles dentro del contexto de una sucursal ([sucursalId]).
 * Usado por el layout de sucursal para las tabs de navegación y por el
 * selector de sucursal para conservar el módulo actual al cambiar de sucursal.
 */
export const MODULOS_SUCURSAL = [
  { key: ROUTES.SUCURSAL.DASHBOARD, label: 'Panel' },
  { key: ROUTES.SUCURSAL.PRODUCTOS, label: 'Productos' },
  { key: ROUTES.SUCURSAL.CATEGORIA, label: 'Categorías' },
  { key: ROUTES.SUCURSAL.INVENTARIO, label: 'Inventario' },
  { key: ROUTES.SUCURSAL.CAJA, label: 'Caja' },
  { key: ROUTES.SUCURSAL.MESAS, label: 'Mesas' },
  { key: ROUTES.SUCURSAL.ORDENES, label: 'Órdenes' },
  { key: ROUTES.SUCURSAL.CONFIGURACION, label: 'Configuración' },
] as const;

export type ModuloSucursalKey = typeof MODULOS_SUCURSAL[number]['key'];

/**
 * Construye la ruta de un módulo para una sucursal específica.
 * Sin módulo (o 'dashboard') apunta al panel principal de la sucursal.
 */
export const rutaSucursal = (
  sucursalId: string | number,
  modulo?: ModuloSucursalKey
): string =>
  modulo && modulo !== 'dashboard'
    ? `/sucursal/${sucursalId}/${modulo}`
    : `/sucursal/${sucursalId}`;

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


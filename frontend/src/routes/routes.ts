/**
 * Definición de rutas de la aplicación POS
 * Basado en el mapa de navegación del sistema
 */

export const ROUTES = {
  // Autenticación
  LOGIN: '/login',
  REGISTER: '/register',
  INDEX: '/',

  // Dashboard Principal
  DASHBOARD: '/dashboard',

  // Panel de Sucursal
  SUCURSAL_PANEL: '/sucursal-panel',

  // Perfil de Usuario
  PERFIL: '/perfil',

  // Módulo de Administración del Sistema
  ADMIN: {
    USUARIOS: '/admin/usuarios',
    EMPLEADOS: '/admin/empleados',
    ROLES: '/admin/roles',
    SUCURSALES: '/admin/sucursales',
  },

  // Módulo de Configuración
  CONFIG: {
    MESAS: '/config/mesas',
    CATEGORIAS: '/config/categorias',
    CAJAS: '/config/cajas',
  },

  // Módulo de Productos y Menú
  PRODUCTOS: {
    PRODUCTOS: '/productos/productos',
    EXTRAS: '/productos/extras',
    RECETAS: '/productos/recetas',
  },

  // Módulo de Inventario
  INVENTARIO: {
    MATERIALES: '/inventario/materiales',
    EXISTENCIAS: '/inventario/existencias',
    COMPRAS: '/inventario/compras',
    PRODUCCION: '/inventario/produccion',
  },

  // Módulo de Punto de Venta
  POS: {
    VISTA_MESAS: '/pos/vista-mesas',
    CREAR_ORDEN: '/pos/crear-orden',
    ORDENES: '/pos/ordenes',
    DETALLE_ORDEN: '/pos/detalle-orden',
    COCINA: '/pos/cocina',
  },

  // Módulo de Gestión de Caja
  CAJA: {
    APERTURA: '/caja/apertura',
    COBRO: '/caja/cobro',
    MOVIMIENTOS: '/caja/movimientos',
    CIERRE: '/caja/cierre',
    GASTOS: '/caja/gastos',
  },

  // Módulo de Reportes y Análisis
  REPORTES: {
    VENTAS: '/reportes/ventas',
    INVENTARIO: '/reportes/inventario',
    GASTOS: '/reportes/gastos',
    CORTES: '/reportes/cortes',
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
    ROUTES.DASHBOARD,
    ROUTES.SUCURSAL_PANEL,
    ROUTES.PERFIL,
    // Administración
    ROUTES.ADMIN.USUARIOS,
    ROUTES.ADMIN.EMPLEADOS,
    ROUTES.ADMIN.ROLES,
    ROUTES.ADMIN.SUCURSALES,
    // Configuración
    ROUTES.CONFIG.MESAS,
    ROUTES.CONFIG.CATEGORIAS,
    ROUTES.CONFIG.CAJAS,
    // Productos
    ROUTES.PRODUCTOS.PRODUCTOS,
    ROUTES.PRODUCTOS.EXTRAS,
    ROUTES.PRODUCTOS.RECETAS,
    // Inventario
    ROUTES.INVENTARIO.MATERIALES,
    ROUTES.INVENTARIO.EXISTENCIAS,
    ROUTES.INVENTARIO.COMPRAS,
    ROUTES.INVENTARIO.PRODUCCION,
    // POS
    ROUTES.POS.VISTA_MESAS,
    ROUTES.POS.CREAR_ORDEN,
    ROUTES.POS.ORDENES,
    ROUTES.POS.DETALLE_ORDEN,
    ROUTES.POS.COCINA,
    // Caja
    ROUTES.CAJA.APERTURA,
    ROUTES.CAJA.COBRO,
    ROUTES.CAJA.MOVIMIENTOS,
    ROUTES.CAJA.CIERRE,
    ROUTES.CAJA.GASTOS,
    // Reportes
    ROUTES.REPORTES.VENTAS,
    ROUTES.REPORTES.INVENTARIO,
    ROUTES.REPORTES.GASTOS,
    ROUTES.REPORTES.CORTES,
  ],

  // GERENTE: Configuración, productos, inventario y reportes (no administración de usuarios)
  [Rol.GERENTE]: [
    ROUTES.DASHBOARD,
    ROUTES.SUCURSAL_PANEL,
    ROUTES.PERFIL,
    // Configuración
    ROUTES.CONFIG.MESAS,
    ROUTES.CONFIG.CATEGORIAS,
    ROUTES.CONFIG.CAJAS,
    // Productos
    ROUTES.PRODUCTOS.PRODUCTOS,
    ROUTES.PRODUCTOS.EXTRAS,
    ROUTES.PRODUCTOS.RECETAS,
    // Inventario
    ROUTES.INVENTARIO.MATERIALES,
    ROUTES.INVENTARIO.EXISTENCIAS,
    ROUTES.INVENTARIO.COMPRAS,
    ROUTES.INVENTARIO.PRODUCCION,
    // POS
    ROUTES.POS.VISTA_MESAS,
    ROUTES.POS.CREAR_ORDEN,
    ROUTES.POS.ORDENES,
    ROUTES.POS.DETALLE_ORDEN,
    // Caja
    ROUTES.CAJA.APERTURA,
    ROUTES.CAJA.COBRO,
    ROUTES.CAJA.MOVIMIENTOS,
    ROUTES.CAJA.CIERRE,
    ROUTES.CAJA.GASTOS,
    // Reportes
    ROUTES.REPORTES.VENTAS,
    ROUTES.REPORTES.INVENTARIO,
    ROUTES.REPORTES.GASTOS,
    ROUTES.REPORTES.CORTES,
  ],

  // MESERO: Órdenes, mesas y caja (operaciones de punto de venta)
  [Rol.MESERO]: [
    ROUTES.DASHBOARD,
    ROUTES.SUCURSAL_PANEL,
    ROUTES.PERFIL,
    // POS
    ROUTES.POS.VISTA_MESAS,
    ROUTES.POS.CREAR_ORDEN,
    ROUTES.POS.ORDENES,
    ROUTES.POS.DETALLE_ORDEN,
    // Caja (solo cobro)
    ROUTES.CAJA.COBRO,
  ],

  // COCINA: Pantalla de cocina y producción
  [Rol.COCINA]: [
    ROUTES.DASHBOARD,
    ROUTES.SUCURSAL_PANEL,
    ROUTES.PERFIL,
    // POS (solo cocina)
    ROUTES.POS.COCINA,
    // Inventario (solo producción)
    ROUTES.INVENTARIO.PRODUCCION,
  ],
};

/**
 * Obtiene la ruta inicial según el rol del usuario
 */
export const obtenerRutaInicialPorRol = (rol: string | null): string => {
  if (!rol) return ROUTES.LOGIN;

  switch (rol) {
    case Rol.ADMINISTRADOR:
    case Rol.GERENTE:
      return ROUTES.DASHBOARD;
    case Rol.MESERO:
      return ROUTES.POS.VISTA_MESAS;
    case Rol.COCINA:
      return ROUTES.POS.COCINA;
    default:
      return ROUTES.DASHBOARD;
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

/**
 * Estructura de menú para navegación
 */
export interface MenuItem {
  titulo: string;
  ruta?: string;
  icono?: string;
  submenu?: MenuItem[];
  rolesPermitidos: string[];
}

/**
 * Configuración del menú de navegación
 */
export const MENU_NAVEGACION: MenuItem[] = [
  {
    titulo: 'Dashboard',
    ruta: ROUTES.DASHBOARD,
    icono: 'dashboard',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO, Rol.COCINA],
  },
  {
    titulo: 'Administración',
    icono: 'admin',
    rolesPermitidos: [Rol.ADMINISTRADOR],
    submenu: [
      {
        titulo: 'Usuarios',
        ruta: ROUTES.ADMIN.USUARIOS,
        rolesPermitidos: [Rol.ADMINISTRADOR],
      },
      {
        titulo: 'Empleados',
        ruta: ROUTES.ADMIN.EMPLEADOS,
        rolesPermitidos: [Rol.ADMINISTRADOR],
      },
      {
        titulo: 'Roles y Permisos',
        ruta: ROUTES.ADMIN.ROLES,
        rolesPermitidos: [Rol.ADMINISTRADOR],
      },
      {
        titulo: 'Sucursales',
        ruta: ROUTES.ADMIN.SUCURSALES,
        rolesPermitidos: [Rol.ADMINISTRADOR],
      },
    ],
  },
  {
    titulo: 'Configuración',
    icono: 'settings',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
    submenu: [
      {
        titulo: 'Mesas',
        ruta: ROUTES.CONFIG.MESAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Categorías',
        ruta: ROUTES.CONFIG.CATEGORIAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Cajas',
        ruta: ROUTES.CONFIG.CAJAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
    ],
  },
  {
    titulo: 'Productos y Menú',
    icono: 'restaurant',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
    submenu: [
      {
        titulo: 'Productos',
        ruta: ROUTES.PRODUCTOS.PRODUCTOS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Extras',
        ruta: ROUTES.PRODUCTOS.EXTRAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Recetas',
        ruta: ROUTES.PRODUCTOS.RECETAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
    ],
  },
  {
    titulo: 'Inventario',
    icono: 'inventory',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.COCINA],
    submenu: [
      {
        titulo: 'Materiales',
        ruta: ROUTES.INVENTARIO.MATERIALES,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Existencias',
        ruta: ROUTES.INVENTARIO.EXISTENCIAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Compras',
        ruta: ROUTES.INVENTARIO.COMPRAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Producción',
        ruta: ROUTES.INVENTARIO.PRODUCCION,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.COCINA],
      },
    ],
  },
  {
    titulo: 'Punto de Venta',
    icono: 'point_of_sale',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO, Rol.COCINA],
    submenu: [
      {
        titulo: 'Vista de Mesas',
        ruta: ROUTES.POS.VISTA_MESAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO],
      },
      {
        titulo: 'Crear Orden',
        ruta: ROUTES.POS.CREAR_ORDEN,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO],
      },
      {
        titulo: 'Órdenes',
        ruta: ROUTES.POS.ORDENES,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO],
      },
      {
        titulo: 'Cocina',
        ruta: ROUTES.POS.COCINA,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.COCINA],
      },
    ],
  },
  {
    titulo: 'Gestión de Caja',
    icono: 'cash_register',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO],
    submenu: [
      {
        titulo: 'Apertura de Caja',
        ruta: ROUTES.CAJA.APERTURA,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Cobro',
        ruta: ROUTES.CAJA.COBRO,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO],
      },
      {
        titulo: 'Movimientos',
        ruta: ROUTES.CAJA.MOVIMIENTOS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Cierre de Caja',
        ruta: ROUTES.CAJA.CIERRE,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Gastos',
        ruta: ROUTES.CAJA.GASTOS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
    ],
  },
  {
    titulo: 'Reportes y Análisis',
    icono: 'analytics',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
    submenu: [
      {
        titulo: 'Reporte de Ventas',
        ruta: ROUTES.REPORTES.VENTAS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Reporte de Inventario',
        ruta: ROUTES.REPORTES.INVENTARIO,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Reporte de Gastos',
        ruta: ROUTES.REPORTES.GASTOS,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
      {
        titulo: 'Reporte de Cortes',
        ruta: ROUTES.REPORTES.CORTES,
        rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE],
      },
    ],
  },
  {
    titulo: 'Perfil',
    ruta: ROUTES.PERFIL,
    icono: 'person',
    rolesPermitidos: [Rol.ADMINISTRADOR, Rol.GERENTE, Rol.MESERO, Rol.COCINA],
  },
];

/**
 * Filtra el menú según el rol del usuario
 */
export const filtrarMenuPorRol = (rol: string | null): MenuItem[] => {
  if (!rol) return [];

  const filtrarItem = (item: MenuItem): MenuItem | null => {
    if (!item.rolesPermitidos.includes(rol)) {
      return null;
    }

    if (item.submenu) {
      const submenuFiltrado = item.submenu
        .map(filtrarItem)
        .filter((subitem): subitem is MenuItem => subitem !== null);

      if (submenuFiltrado.length === 0) {
        return null;
      }

      return {
        ...item,
        submenu: submenuFiltrado,
      };
    }

    return item;
  };

  return MENU_NAVEGACION
    .map(filtrarItem)
    .filter((item): item is MenuItem => item !== null);
};

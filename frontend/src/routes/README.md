# Sistema de Rutas con Control de Acceso por Roles

Este sistema implementa un control de acceso basado en roles para la aplicación POS.

## 📁 Archivos Principales

### `/frontend/src/routes/routes.ts`
Archivo central que define:
- **ROUTES**: Objeto con todas las rutas de la aplicación organizadas por módulos
- **Rol**: Enum con los 4 roles del sistema
- **PERMISOS_POR_ROL**: Mapeo de roles a rutas permitidas
- **MENU_NAVEGACION**: Estructura del menú con permisos por item
- **Funciones helper**: Para verificar permisos y filtrar menús

### `/frontend/src/components/ProtectedRoute.tsx`
Componente para proteger rutas. Verifica:
1. Si el usuario está autenticado
2. Si tiene permiso para acceder a la ruta
3. Redirige al login o dashboard según corresponda

### `/frontend/src/hooks/useRoleBasedNavigation.ts`
Hook personalizado que proporciona:
- El rol del usuario actual
- El menú filtrado según su rol
- Función para verificar permisos
- Lista de rutas permitidas

## 🔐 Roles del Sistema

### 1. ADMINISTRADOR
- **Acceso**: Total
- **Rutas iniciales**: Dashboard
- **Permisos**: Todos los módulos incluyendo administración de usuarios

### 2. GERENTE
- **Acceso**: Configuración, productos, inventario, reportes
- **Rutas iniciales**: Dashboard
- **Permisos**: Todos excepto administración de usuarios

### 3. MESERO
- **Acceso**: Punto de venta y cobro
- **Rutas iniciales**: Vista de mesas
- **Permisos**: Operaciones de servicio (órdenes, mesas, cobro)

### 4. COCINA
- **Acceso**: Pantalla de cocina y producción
- **Rutas iniciales**: Pantalla de cocina
- **Permisos**: Solo visualización de órdenes y producción

## 🚀 Uso

### 1. Proteger una pantalla

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/routes/routes';

export default function UsuariosScreen() {
  return (
    <ProtectedRoute requiredRoute={ROUTES.ADMIN.USUARIOS}>
      <View>
        {/* Tu contenido aquí */}
      </View>
    </ProtectedRoute>
  );
}
```

### 2. Usar el hook de navegación

```typescript
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

export default function MyComponent() {
  const { menu, rol, verificarPermiso } = useRoleBasedNavigation();

  // Verificar si puede acceder a una ruta
  const puedeVerReportes = verificarPermiso(ROUTES.REPORTES.VENTAS);

  // Usar el menú filtrado
  return (
    <View>
      {menu.map(item => (
        <MenuItem key={item.titulo} item={item} />
      ))}
    </View>
  );
}
```

### 3. Redirección según rol

```typescript
import { obtenerRutaSegunRol } from '@/features/usuario/auth/auth.helpers';

// Después del login
const rutaInicial = obtenerRutaSegunRol(token);
router.replace(rutaInicial);
```

## 📋 Módulos y Rutas

### Autenticación
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/` - Página inicial (redirige según autenticación)

### Dashboard
- `/dashboard` - Dashboard principal (todos los roles)
- `/perfil` - Perfil de usuario (todos los roles)

### Administración (Solo ADMINISTRADOR)
- `/admin/usuarios` - Gestión de usuarios
- `/admin/empleados` - Gestión de empleados
- `/admin/roles` - Gestión de roles y permisos
- `/admin/sucursales` - Gestión de sucursales

### Configuración (ADMINISTRADOR, GERENTE)
- `/config/mesas` - Configuración de mesas
- `/config/categorias` - Categorías de productos
- `/config/cajas` - Configuración de cajas

### Productos (ADMINISTRADOR, GERENTE)
- `/productos/productos` - Gestión de productos
- `/productos/extras` - Gestión de extras
- `/productos/recetas` - Gestión de recetas

### Inventario (ADMINISTRADOR, GERENTE, COCINA*)
- `/inventario/materiales` - Catálogo de materiales
- `/inventario/existencias` - Control de existencias
- `/inventario/compras` - Registro de compras
- `/inventario/produccion` - Producción* (COCINA solo esta)

### Punto de Venta
- `/pos/vista-mesas` - Vista de mesas (ADMIN, GERENTE, MESERO)
- `/pos/crear-orden` - Crear orden (ADMIN, GERENTE, MESERO)
- `/pos/ordenes` - Listado de órdenes (ADMIN, GERENTE, MESERO)
- `/pos/detalle-orden` - Detalle de orden (ADMIN, GERENTE, MESERO)
- `/pos/cocina` - Pantalla de cocina (ADMIN, GERENTE, COCINA)

### Gestión de Caja
- `/caja/apertura` - Apertura de caja (ADMIN, GERENTE)
- `/caja/cobro` - Cobro (ADMIN, GERENTE, MESERO)
- `/caja/movimientos` - Movimientos (ADMIN, GERENTE)
- `/caja/cierre` - Cierre de caja (ADMIN, GERENTE)
- `/caja/gastos` - Registro de gastos (ADMIN, GERENTE)

### Reportes (ADMINISTRADOR, GERENTE)
- `/reportes/ventas` - Reporte de ventas
- `/reportes/inventario` - Reporte de inventario
- `/reportes/gastos` - Reporte de gastos
- `/reportes/cortes` - Reporte de cortes de caja

## 🔧 Funciones Helper

### `obtenerRutaInicialPorRol(rol: string | null): string`
Retorna la ruta inicial apropiada según el rol del usuario.

### `tienePermisoParaRuta(rol: string | null, ruta: string): boolean`
Verifica si un usuario con cierto rol tiene permiso para acceder a una ruta.

### `obtenerRutasPermitidas(rol: string | null): string[]`
Retorna un array con todas las rutas permitidas para un rol.

### `filtrarMenuPorRol(rol: string | null): MenuItem[]`
Filtra el menú de navegación para mostrar solo los items permitidos.

## 🎯 Flujo de Autenticación

1. Usuario inicia sesión en `/login`
2. Backend retorna JWT con el rol incluido
3. Frontend decodifica el token y extrae el rol
4. Sistema redirige a la ruta inicial según el rol
5. Cada pantalla verifica permisos con `ProtectedRoute`
6. Menú de navegación se filtra automáticamente

## 🛡️ Seguridad

- **Frontend**: Validación de permisos en cada ruta
- **Backend**: JWT con rol incluido
- **Componentes**: `ProtectedRoute` previene acceso no autorizado
- **Redirecciones**: Usuarios sin permiso son redirigidos
- **Token**: Decodificación segura con manejo de errores

## 📝 Ejemplos de Integración

### Actualizar pantallas existentes

Para proteger todas las pantallas existentes, envuelve el contenido en `ProtectedRoute`:

```typescript
// Antes
export default function MiPantalla() {
  return <View>...</View>;
}

// Después
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/routes/routes';

export default function MiPantalla() {
  return (
    <ProtectedRoute requiredRoute={ROUTES.MODULO.PANTALLA}>
      <View>...</View>
    </ProtectedRoute>
  );
}
```

### Crear menú lateral

```typescript
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

export function SideMenu() {
  const { menu } = useRoleBasedNavigation();
  const router = useRouter();

  return (
    <View>
      {menu.map((item, index) => (
        <View key={index}>
          <Text>{item.titulo}</Text>
          {item.submenu?.map((subitem, subindex) => (
            <TouchableOpacity
              key={subindex}
              onPress={() => router.push(subitem.ruta as any)}
            >
              <Text>{subitem.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
```

## 🐛 Troubleshooting

### "Cannot read property 'rol' of undefined"
- Verifica que el token JWT incluya el campo `rol`
- Revisa que `JwtPayload` tenga la propiedad `rol` definida

### "Redirect loop"
- Asegúrate de que `/login` no esté protegido
- Verifica que el index redirija correctamente según autenticación

### "No se muestra el menú"
- Confirma que el token se decodifique correctamente
- Verifica que el rol en el token coincida con los enum definidos

## 📚 Próximos Pasos

1. ✅ Sistema de rutas implementado
2. ✅ Control de acceso por roles
3. ✅ Componente de protección de rutas
4. ✅ Hook de navegación basada en roles
5. ⏳ Aplicar `ProtectedRoute` a todas las pantallas
6. ⏳ Implementar menú lateral con navegación
7. ⏳ Agregar indicadores visuales de rol en la UI
8. ⏳ Testing de permisos y flujos

---

**Nota**: Este sistema está basado en el mapa de navegación UML del proyecto y sigue las mejores prácticas de seguridad para aplicaciones React Native con Expo Router.

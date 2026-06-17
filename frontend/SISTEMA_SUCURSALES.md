# Sistema de Gestión de Sucursales

## 📋 Descripción

Sistema completo de gestión de sucursales con validación obligatoria antes de acceder a módulos operativos (POS, Productos, Inventario, Caja, Reportes).

## 🎨 Características del Dashboard Móvil

### Diseño Moderno
- **Header con gradiente** azul con bordes redondeados
- **Selector de sucursal** prominente e interactivo
- **Cards de módulos** con iconos, badges de advertencia y botones de acción
- **Diseño responsive** optimizado para móvil
- **Animaciones y sombras** para mejor UX

### Componentes Visuales
- 🏢 Selector de sucursal con información clara
- 📊 Iconos emoji para cada módulo (sin dependencias adicionales)
- ⚠️ Badges de advertencia para módulos que requieren sucursal
- 🚪 Botón de logout en el header

## 🏢 Sistema de Sucursales

### Características
1. **Selección obligatoria**: Módulos operativos requieren sucursal
2. **Modal de selección**: Interface moderna para elegir/crear sucursal
3. **Persistencia**: La sucursal se guarda en sessionStorage
4. **Creación inline**: Posibilidad de crear sucursal sin salir del flujo

### Módulos que Requieren Sucursal
- ✅ Productos y Menú
- ✅ Inventario
- ✅ Punto de Venta
- ✅ Gestión de Caja
- ✅ Reportes y Análisis

### Módulos Sin Restricción de Sucursal
- Dashboard
- Administración (usuarios, empleados, roles, sucursales)
- Configuración (mesas, categorías, cajas)
- Perfil

## 📁 Archivos Creados

### Features de Sucursal

#### `/features/sucursal/sucursal.types.ts`
Define las interfaces TypeScript:
- `Sucursal`: Modelo completo de sucursal
- `SucursalState`: Estado del slice de Redux
- `CreateSucursalDTO`: DTO para crear sucursal

#### `/features/sucursal/sucursal.service.ts`
Servicios API:
- `getAll()`: Obtener todas las sucursales
- `getById(id)`: Obtener sucursal por ID
- `create(data)`: Crear nueva sucursal
- `update(id, data)`: Actualizar sucursal
- `delete(id)`: Eliminar sucursal

#### `/features/sucursal/sucursal.slice.ts`
Redux slice con:
- Estado inicial con carga desde sessionStorage
- Acciones: `setSucursalActual`, `clearSucursalActual`, `clearError`
- Extra reducers para thunks asíncronos
- Persistencia automática en sessionStorage

#### `/features/sucursal/sucursal.thunk.ts`
Thunks asíncronos:
- `fetchSucursales`: Cargar todas las sucursales
- `createSucursal`: Crear nueva sucursal

#### `/features/sucursal/useSucursal.ts`
Hook personalizado que expone:
```typescript
{
  sucursalActual,      // Sucursal seleccionada
  sucursales,          // Lista de todas las sucursales
  loading,             // Estado de carga
  error,               // Error si existe
  seleccionarSucursal, // Función para seleccionar
  limpiarSucursal,     // Limpiar sucursal actual
  crearSucursal,       // Crear nueva sucursal
  recargarSucursales,  // Recargar lista
  limpiarError,        // Limpiar error
}
```

### Componentes

#### `/components/SucursalSelector.tsx`
Modal de selección de sucursal con:
- **Vista de lista**: Muestra todas las sucursales disponibles
- **Indicador de selección**: Check mark en sucursal actual
- **Formulario de creación**: Inline para crear nueva sucursal
- **Estado vacío**: Mensaje cuando no hay sucursales
- **Loading state**: Indicador de carga

**Props:**
```typescript
interface SucursalSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: () => void; // Callback después de seleccionar
}
```

#### `/components/SucursalRequiredRoute.tsx`
Componente de protección que:
- Valida autenticación (vía `ProtectedRoute`)
- Valida permisos de rol
- Valida que exista sucursal seleccionada
- Muestra mensaje amigable si no hay sucursal
- Botón para regresar al dashboard

**Uso:**
```typescript
<SucursalRequiredRoute requiredRoute={ROUTES.PRODUCTOS.PRODUCTOS}>
  <YourComponent />
</SucursalRequiredRoute>
```

## 🚀 Flujo de Usuario

### 1. Login
Usuario inicia sesión → Redirigido al dashboard

### 2. Dashboard
- Ve su rol y módulos disponibles
- Ve el selector de sucursal (sin sucursal seleccionada)
- Ve badges de advertencia en módulos que requieren sucursal

### 3. Selección de Sucursal
**Opción A: Desde el dashboard**
1. Usuario toca el selector de sucursal
2. Se abre modal con lista de sucursales
3. Selecciona una sucursal
4. Modal se cierra, sucursal queda seleccionada

**Opción B: Al intentar acceder a módulo protegido**
1. Usuario toca un módulo que requiere sucursal
2. Si no hay sucursal → Se abre modal automáticamente
3. Usuario selecciona sucursal
4. Modal se cierra y navega al módulo

### 4. Crear Sucursal (si no existe ninguna)
1. En el modal, usuario toca "Nueva Sucursal"
2. Se muestra formulario inline
3. Usuario completa campos obligatorios:
   - Nombre
   - Código
   - Dirección
   - Teléfono (opcional)
   - Email (opcional)
4. Al crear, se selecciona automáticamente
5. Usuario puede continuar al módulo

### 5. Navegación con Sucursal
- Sucursal se muestra en header de cada módulo
- Se mantiene en sessionStorage
- Persiste durante la sesión
- Se limpia al hacer logout

## 🔧 Integración con Store

El store de Redux incluye el reducer de sucursal:

```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
    sucursal: sucursalReducer, // ← Nuevo
  },
});
```

## 💻 Ejemplos de Uso

### Dashboard con Sucursal

```typescript
import { useSucursal } from '@/features/sucursal/useSucursal';

export default function DashboardScreen() {
  const { sucursalActual } = useSucursal();
  const [mostrarSelector, setMostrarSelector] = useState(false);

  const verificarYNavegar = (ruta: string, modulo: string) => {
    if (MODULOS_CON_SUCURSAL.includes(modulo) && !sucursalActual) {
      setMostrarSelector(true);
      return;
    }
    router.push(ruta);
  };

  return (
    <>
      {/* Selector de sucursal en header */}
      <TouchableOpacity onPress={() => setMostrarSelector(true)}>
        <Text>{sucursalActual?.nombre || 'Sin Sucursal'}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <SucursalSelector
        visible={mostrarSelector}
        onClose={() => setMostrarSelector(false)}
        onSelect={handleSucursalSeleccionada}
      />
    </>
  );
}
```

### Pantalla Protegida con Sucursal

```typescript
import { SucursalRequiredRoute } from '@/components/SucursalRequiredRoute';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { ROUTES } from '@/routes/routes';

export default function ProductosScreen() {
  const { sucursalActual } = useSucursal();

  return (
    <SucursalRequiredRoute requiredRoute={ROUTES.PRODUCTOS.PRODUCTOS}>
      <View>
        <Text>Gestión de Productos</Text>
        <Text>Sucursal: {sucursalActual?.nombre}</Text>
        {/* Tu contenido aquí */}
      </View>
    </SucursalRequiredRoute>
  );
}
```

### Hook en Cualquier Componente

```typescript
import { useSucursal } from '@/features/sucursal/useSucursal';

function MiComponente() {
  const {
    sucursalActual,
    sucursales,
    loading,
    seleccionarSucursal,
    crearSucursal,
  } = useSucursal();

  // Usar sucursal actual en consultas API
  useEffect(() => {
    if (sucursalActual) {
      fetchProductos(sucursalActual.id);
    }
  }, [sucursalActual]);

  return <View>...</View>;
}
```

## 🎯 Pantallas Actualizadas

Las siguientes pantallas ya usan `SucursalRequiredRoute`:
- ✅ `/productos/productos.tsx`
- ✅ `/pos/vista-mesas.tsx`
- ✅ `/inventario/materiales.tsx`
- ✅ `/caja/apertura.tsx`
- ✅ `/reportes/ventas.tsx`

### Actualizar Pantallas Restantes

Para actualizar las demás pantallas, sigue este patrón:

```typescript
// Antes
import { ProtectedRoute } from '@/components/ProtectedRoute';
export default function MiPantalla() {
  return (
    <ProtectedRoute requiredRoute={ROUTES.MODULO.PANTALLA}>
      <View>...</View>
    </ProtectedRoute>
  );
}

// Después
import { SucursalRequiredRoute } from '@/components/SucursalRequiredRoute';
import { useSucursal } from '@/features/sucursal/useSucursal';
export default function MiPantalla() {
  const { sucursalActual } = useSucursal();
  return (
    <SucursalRequiredRoute requiredRoute={ROUTES.MODULO.PANTALLA}>
      <View>
        <Text>Sucursal: {sucursalActual?.nombre}</Text>
        ...
      </View>
    </SucursalRequiredRoute>
  );
}
```

## 📱 Diseño del Dashboard

### Estructura Visual
```
┌─────────────────────────────────┐
│  Header (Azul con gradiente)   │
│  👤 Bienvenido                  │
│     Administrador            🚪 │
│                                 │
│  🏢 Sucursal Actual              │
│     Centro - SUC001           › │
└─────────────────────────────────┘
│                                 │
│  Módulos del Sistema            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📊 Dashboard            │   │
│  │ └─ Abrir                │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🍽️ Productos y Menú     │   │
│  │ ⚠️ Requiere sucursal     │   │
│  │ ├─ Productos          → │   │
│  │ ├─ Extras             → │   │
│  │ └─ Recetas            → │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 💳 Punto de Venta       │   │
│  │ ├─ Vista de Mesas     → │   │
│  │ ├─ Crear Orden        → │   │
│  │ └─ Cocina             → │   │
│  └─────────────────────────┘   │
```

## 🛡️ Seguridad

- **Autenticación**: JWT token validado en cada request
- **Autorización por rol**: Validada en frontend y backend
- **Sucursal en contexto**: Asociada a operaciones específicas
- **Persistencia segura**: sessionStorage (se limpia al cerrar pestaña)

## 🐛 Troubleshooting

### "No se muestra la sucursal actual"
- Verificar que el reducer de sucursal esté en el store
- Revisar que sessionStorage no esté bloqueado
- Confirmar que el backend retorne sucursales

### "Modal no se cierra después de seleccionar"
- Asegurar que `onSelect` callback esté implementado
- Verificar que `onClose` se llame correctamente

### "Error al crear sucursal"
- Verificar campos obligatorios (nombre, código, dirección)
- Revisar endpoint del backend
- Confirmar permisos del usuario

## 📚 Próximos Pasos

1. ✅ Sistema de sucursales implementado
2. ✅ Dashboard con diseño móvil
3. ✅ Validación de sucursal en módulos operativos
4. ✅ Modal de selección/creación de sucursal
5. ⏳ Aplicar `SucursalRequiredRoute` a todas las pantallas restantes
6. ⏳ Agregar filtros por sucursal en consultas API
7. ⏳ Implementar cambio rápido de sucursal desde cualquier pantalla
8. ⏳ Agregar indicador visual de sucursal en navegación

---

**Nota**: El sistema está completamente funcional y listo para usar. Las sucursales se cargan automáticamente al iniciar la app y persisten durante la sesión del usuario.

# Redesign de la Sección POS

## Cambios Realizados

### 1. Nuevos Componentes Creados

Se han creado 6 nuevos componentes en `src/features/pos/presentation/components/`:

#### **OrderTypeSelector.tsx**
- Selector de tipo de orden con badges/botones visuales
- Opciones: **Llevar**, **Recoger**, **Mesa**, **A Domicilio**
- Iconos descriptivos para cada tipo de orden
- Selección única

#### **TableSelector.tsx**
- Selector mejorado de mesas para órdenes tipo "EN_MESA"
- Mostrar mesas como tarjetas visuales
- Información de mesa: nombre, número y capacidad
- Modal de selección intuitiva

#### **CartSummary.tsx**
- Componente flotante en la parte inferior
- Resumen rápido del carrito (cantidad de ítems y total)
- No obliga al usuario a abandonar la selección de productos
- Acceso rápido al carrito completo

#### **ModifierModal.tsx**
- Modal mejorada para selección de modificadores
- Mostrar claramente:
  - Nombre del grupo de modificadores
  - Opciones disponibles con precios
  - Cantidades seleccionables
  - Total adicional en tiempo real
- Navegación clara para agregar/quitar modificadores

#### **PaymentMethods.tsx**
- Métodos de pago como recuadros visuales con iconos
- Opciones: Efectivo, Débito, Crédito, Transferencia, Digital
- Diseño intuitivo y fácil de seleccionar
- Colores distintivos por método

#### **SplitPayment.tsx**
- Soporte para pago dividido (múltiples métodos)
- Resumen del pago:
  - Total de la orden
  - Total pagado
  - Restante o excedente
  - Métodos utilizados
- Validación en tiempo real
- Agregar/eliminar métodos dinámicamente

### 2. PosHomeScreen.tsx Refactorizado

#### **Flujo de Nueva Orden Mejorado:**

1. **Selección de Tipo de Orden** (Requerido primero)
   - Badges/botones superiores
   - Selección clara antes de cualquier otra acción

2. **Selección de Mesa** (Si es tipo EN_MESA)
   - Solo aparece si selecciona "En mesa"
   - Tarjeta visual con información clara

3. **Selección de Productos**
   - Catálogo por categorías
   - Al hacer clic en un producto:
     - Si tiene modificadores → Abre modal
     - Si no tiene modificadores → Agrega directamente
   - Productos como botones/tarjetas

4. **Carrito Flotante**
   - Disponible en la parte inferior
   - Resumen de cantidad y subtotal
   - No interrumpe la selección de productos
   - Presionar para ver detalle completo

#### **Modal de Carrito Completo:**
- Ver todos los productos
- Cambiar cantidades
- Modificar modificadores
- Agregar notas para cocina
- Resumen de totales

#### **Modal de Modificadores:**
- Selección clara de opciones
- Cantidades editables
- Precio adicional mostrado
- Confirmación fácil

#### **Modal de Pagos:**
- Dos modos:
  1. **Método Único**: PaymentMethods component
  2. **Pago Dividido**: SplitPayment component
- Cambio fácil entre modos
- Validación de montos

### 3. Características Nuevas

✅ **Flujo visual mejorado**: Tipo de orden → Mesa (si aplica) → Productos → Carrito → Pago

✅ **Selector de tipo de orden con iconos**: Badges/botones visuales superiores

✅ **Modal de modificadores mejorada**: Interfaz clara y fácil de usar

✅ **Carrito flotante**: No obliga a abandonar la selección de productos

✅ **Pago dividido**: Múltiples métodos de pago con validación

✅ **Pagos visuales**: Recuadros con iconos en lugar de select

✅ **Validaciones mejoradas**: Previene errores comunes

✅ **UX/UI consistente**: Colores, espacios y fuentes uniformes

### 4. Estructura de Componentes

```
src/features/pos/presentation/
├── components/
│   ├── OrderTypeSelector.tsx     ← Selector de tipo de orden
│   ├── TableSelector.tsx         ← Selector de mesas
│   ├── CartSummary.tsx          ← Resumen flotante
│   ├── ModifierModal.tsx        ← Modal de modificadores
│   ├── PaymentMethods.tsx       ← Métodos de pago
│   ├── SplitPayment.tsx         ← Pago dividido
│   └── index.ts                 ← Exporta todos
├── screens/
│   └── PosHomeScreen.tsx        ← Pantalla principal refactorizada
└── ...
```

### 5. Tipos Utilizados

Se reutilizan los DTOs existentes:
- `TipoOrden`: "EN_MESA" | "PARA_LLEVAR" | "DELIVERY" | "RECOGER"
- `MetodoPago`: EFECTIVO, DIGITAL, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA_BANCARIA, MIXTO, GRATIS
- `OrdenDto`, `DetalleOrdenDto`, `ProductoDto`
- `MesaDto`

Nuevas interfaces locales:
- `SplitPaymentItem`: { metodo: MetodoPago; monto: number }
- `LineaCarrito`: Representa cada línea del carrito

### 6. Validaciones Implementadas

- ✅ Orden válida solo si tiene tipo + (mesa si es EN_MESA)
- ✅ Pago dividido: totalPagado >= totalOrden
- ✅ No permite crear orden sin productos
- ✅ No permite cobrar sin caja abierta
- ✅ Modificadores mostrados solo si producto los tiene

## Cómo Usar

### Para Crear una Orden:

1. **Selecciona el tipo de orden** (arriba en badges)
2. **Si es "En mesa"**, selecciona la mesa
3. **Selecciona productos** del catálogo
4. **Los modificadores se mostrarán en modal** si el producto los tiene
5. **Revisa el carrito flotante** (parte inferior)
6. **Crea la orden** desde el card "Orden"

### Para Hacer Pago:

1. **En órdenes**, selecciona "Cobrar"
2. **Elige método único** O **pago dividido**
3. **Ingresa montos** (validado en tiempo real)
4. **Confirma el pago**

## Próximas Mejoras Sugeridas

- [ ] Historial de mesas con órdenes activas
- [ ] Búsqueda rápida de productos
- [ ] Atajos de teclado para métodos de pago
- [ ] Impresión/previsualización de orden
- [ ] Descuentos aplicables por orden
- [ ] Combo de productos predefinidos

## Notas Técnicas

- Todos los componentes son estateless (reciben props)
- La lógica de estado está en PosHomeScreen
- Se reutiliza la lógica de `usePos` existente
- Se mantiene compatibilidad con el backend actual
- CSS con Tailwind (className)
- React Native components (Pressable, ScrollView, Modal, etc.)

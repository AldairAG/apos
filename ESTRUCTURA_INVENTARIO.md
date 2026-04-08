# Sistema de Inventario y Recetas - Estructura de Base de Datos

## ⭐ NUEVA FUNCIONALIDAD: Recetas Anidadas

El sistema ahora soporta **recetas que usan otras recetas como ingredientes**.

**Ejemplo:** Para hacer "Banderillas", primero debes elaborar "Masa de Banderilla", que a su vez usa harina y agua.

👉 Ver [RECETAS_ANIDADAS.md](RECETAS_ANIDADAS.md) para guía completa con ejemplos.

---

## Entidades Principales

### 1. **Sucursal**
Representa una sucursal o tienda.
- `id`: Identificador único
- `nombre`: Nombre de la sucursal
- `direccion`: Dirección física
- `telefono`: Teléfono de contacto
- `propietario`: Dueño de la sucursal
- `activa`: Si la sucursal está activa
- **Relaciones:**
  - Tiene un `Inventario` (One-to-One)
  - Tiene muchas `Recetas` (One-to-Many)
  - Tiene muchos `Usuarios` (Many-to-Many)

### 2. **Material**
Representa materias primas o ingredientes.
- `id`: Identificador único
- `nombre`: Nombre del material
- `descripcion`: Descripción detallada
- `tipoMaterial`: Tipo de material (INGREDIENTE, EMPAQUE, INSUMO, etc.)
- `tipoUnidad`: Unidad de medida (KILOGRAMOS, LITROS, UNIDADES, etc.)
- `activo`: Si el material está activo

### 3. **Inventario**
Inventario específico de una sucursal.
- `id`: Identificador único
- `sucursal`: Sucursal a la que pertenece (One-to-One)
- **Relaciones:**
  - Tiene muchos `InventarioItem` (materiales básicos)
  - Tiene muchos `InventarioProducto` (productos elaborados)

### 4. **InventarioItem** ⭐ (Entidad de Unión)
Representa la cantidad de un material específico en el inventario.
- `id`: Identificador único
- `inventario`: Inventario al que pertenece
- `material`: Material en stock
- `cantidad`: Cantidad actual disponible
- `stockMinimo`: Cantidad mínima recomendada
- `stockMaximo`: Cantidad máxima recomendada
- `precioUnitario`: Precio por unidad
- `fechaUltimaActualizacion`: Última vez que se modificó
- `fechaUltimaCompra`: Última fecha de compra

### 5. **Receta**
Representa una receta o fórmula.
- `id`: Identificador único
- `nombre`: Nombre de la receta
- `descripcion`: Descripción detallada
- `tiempoPreparacion`: Tiempo en minutos
- `porciones`: Número de porciones que produce
- `precioVenta`: Precio de venta sugerido
- `activa`: Si la receta está activa
- `tipoReceta`: INTERMEDIA (se almacena) o FINAL (no se almacena)
- `productoElaborado`: Si genera un producto para inventario
- `sucursal`: Sucursal a la que pertenece
- `fechaCreacion`: Fecha de creación
- `fechaActualizacion`: Última actualización
- **Relaciones:**
  - Tiene muchos `RecetaIngrediente` (One-to-Many)

### 6. **RecetaIngrediente** ⭐ (Entidad de Unión)
Representa un ingrediente requerido en una receta.
- `id`: Identificador único (puede ser null)
- `productoElaborado`: Producto de otra receta (puede ser null)
- `tipoIngrediente`: MATERIAL o PRODUCTO_ELABORADO
- `cantidadRequerida`: Cantidad necesaria
- `notas`: NotatoElaborado** ⭐ NUEVO
Representa el resultado de una receta intermedia que se almacena.
- `id`: Identificador único
- `nombre`: Nombre del producto
- `descripcion`: Descripción
- `recetaOrigen`: Receta que lo crea
- `unidadMedida`: Unidad (porciones, kilos, etc.)
- `activo`: Si está activo
- `fechaCreacion`: Fecha de creación

**Ejemplo:** "Masa de Banderilla", "Salsa Especial", "Relleno de Chocolate"

### 8. **InventarioProducto** ⭐ NUEVO
Almacena productos elaborados en el inventario.
- `id`: Identificador único
- `inventario`: Inventario al que pertenece
- `productoElaborado`: Producto almacenado
- `cantidad`: Cantidad disponible
- `stockMinimo`: Stock mínimo recomendado
- `fechaUltimaActualizacion`: Última modificación
- `fechaUltimaProduccion`: Última vez que se produjo

### 9. **Producs adicionales (ej: "picado finamente")

**IMPORTANTE:** Cada ingrediente es O un Material O un ProductoElaborado, no ambos.
- `cantidadRequerida`: Cantidad necesaria del material
- `notas`: Notas adicionales (ej: "picado finamente")

### 7. **ProduccionReceta**
Registra cada vez que se elabora una receta.
- `id`: Identificador único
- `receta`: Receta elaborada
- `sucursal`: Sucursal donde se elaboró
- `usuario`: Usuario que la elaboró
- `cantidad`: Número de porciones producidas
- `fechaProduccion`: Fecha y hora de producción
- `observaciones`: Notas adicionales

---

## Flujo de Trabajo: Elaborar una Receta

Cuando se elabora una receta, el sistema automáticamente:

1. **Verifica el inventario disponible**
   - Comprueba que haya suficiente cantidad de cada ingrediente
   - Calcula: `cantidadNecesaria = cantidadRequerida × cantidad de porciones`

2. **Disminuye el inventario**
   - Para cada ingrediente de la receta:
     - Resta la cantidad necesaria del `InventarioItem` correspondiente
     - Actualiza la `fechaUltimaActualizacion`

3. **Registra la producción**
   - Crea un registro en `ProduccionReceta` para histórico

---

## Ejemplo de Uso

### Crear un Material
```java
Material harina = new Material();
harina.setNombre("Harina de Trigo");
harina.setTipoMaterial(TipoMaterial.INGREDIENTE);
harina.setTipoUnidad(TipoUnidad.KILOGRAMOS);
harina.setActivo(true);
```

### Agregar al Inventario
```java
InventarioItem itemHarina = new InventarioItem();
itemHarina.setInventario(sucursal.getInventario());
itemHarina.setMaterial(harina);
itemHarina.setCantidad(new BigDecimal("50.0")); // 50 kg
itemHarina.setStockMinimo(new BigDecimal("10.0"));
itemHarina.setPrecioUnitario(new BigDecimal("2.50"));
```

### Crear una Receta
```java
Receta pan = new Receta();
pan.setNombre("Pan Integral");
pan.setTiempoPreparacion(45);
pan.setPorciones(10);
pan.setSucursal(sucursal);
pan.setActiva(true);
```

### Agregar Ingredientes a la Receta
```java
Rece├── InventarioItems (1:N) → Material (N:1)
│   └── InventarioProductos (1:N) → ProductoElaborado (N:1)
│
├── Recetas (1:N)
│   ├── ProductoElaborado (1:1 opcional)
│   └── RecetaIngredientes (1:N)
│       ├── Material (N:1) OR
│       └── ProductoElaborado

### Elaborar la Receta (Disminuye Inventario Automáticamente)
```java
// Esto verificará el inventario y lo disminuirá automáticamente
ProduccionReceta produccion = produccionRecetaService.elaborarReceta(
    pan.getId(),
    sucursal,
    usuario,
    5  // Producir 5 veces la receta (50 porciones)
);
// El inventario de harina se reduce en 10 kg (2 kg × 5)
```

--- de materiales
- `InventarioProductoRepository`: Gestión de inventario de productos elaborados ⭐
- `ProductoElaboradoRepository`: Gestión de productos elaborados ⭐

## Diagrama de Relaciones

```
Sucursal
├── Inventario (1:1)
│   └── InventarioItems (1:N)
│       └── Material (N:1)
│
├── Recetas (1:N)
│   └── RecetaIngredientes (1:N)
│       └── Material (N:1)
│y producto elaborado tiene cantidad y stock mínimo  
✅ **Trazabilidad**: Se registra cada producción con fecha, usuario y observaciones  
✅ **Validación Automática**: Verifica inventario antes de permitir producción  
✅ **Reducción Automática**: El inventario se reduce automáticamente al elaborar  
✅ **Recetas Anidadas**: Las recetas pueden usar otras recetas como ingredientes ⭐  
✅ **Productos Intermedios**: Se almacenan semi-elaborados para usar después ⭐  
✅ **Histórico**: Registro completo de todas las producciones realizadas  
✅ **Multi-sucursal**: Cada sucursal tiene su propio inventario y recetas

---

## 📚 Documentación Relacionada

- [RECETAS_ANIDADAS.md](RECETAS_ANIDADAS.md) - Guía completa de recetas que usan otras- [DIAGRAMA_RECETAS.md](DIAGRAMA_RECETAS.md) - Diagramas visuales del flujo de producción└── Usuario (N:1)
```

---

## Repositorios Incluidos

- `MaterialRepository`: Gestión de materiales
- `RecetaRepository`: Gestión de recetas
- `InventarioItemRepository`: Gestión de inventario
- `ProduccionRecetaRepository`: Histórico de producciones

## Servicios Incluidos

- `ProduccionRecetaService`: Lógica para elaborar recetas y reducir inventario automáticamente

---

## Características Importantes

✅ **Control de Stock**: Cada material tiene cantidad, stock mínimo y máximo  
✅ **Trazabilidad**: Se registra cada producción con fecha, usuario y observaciones  
✅ **Validación Automática**: Verifica inventario antes de permitir producción  
✅ **Reducción Automática**: El inventario se reduce automáticamente al elaborar  
✅ **Histórico**: Registro completo de todas las producciones realizadas  
✅ **Multi-sucursal**: Cada sucursal tiene su propio inventario y recetas

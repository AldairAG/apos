# Guía: Sistema de Recetas Anidadas (Ingredientes que Dependen de Otras Recetas)

## Concepto

El sistema ahora soporta **recetas anidadas**, donde una receta puede usar como ingrediente el resultado de otra receta.

**Ejemplo práctico:**
- **Receta Nivel 1**: "Masa de Banderilla" (usa harina, agua, levadura)
- **Receta Nivel 2**: "Banderillas" (usa la "Masa de Banderilla" ya elaborada, más otros ingredientes)

---

## Flujo Completo: Elaborar Banderillas

### PASO 1: Crear los materiales básicos

```java
// 1. Harina
Material harina = new Material();
harina.setNombre("Harina de Trigo");
harina.setTipoMaterial(TipoMaterial.INGREDIENTE);
harina.setTipoUnidad(TipoUnidad.KILOGRAMOS);
harina.setActivo(true);
materialRepository.save(harina);

// 2. Agua
Material agua = new Material();
agua.setNombre("Agua");
agua.setTipoMaterial(TipoMaterial.INGREDIENTE);
agua.setTipoUnidad(TipoUnidad.LITROS);
agua.setActivo(true);
materialRepository.save(agua);

// 3. Salchicha
Material salchicha = new Material();
salchicha.setNombre("Salchicha");
salchicha.setTipoMaterial(TipoMaterial.INGREDIENTE);
salchicha.setTipoUnidad(TipoUnidad.UNIDADES);
salchicha.setActivo(true);
materialRepository.save(salchicha);
```

### PASO 2: Agregar materiales al inventario

```java
InventarioItem itemHarina = new InventarioItem();
itemHarina.setInventario(sucursal.getInventario());
itemHarina.setMaterial(harina);
itemHarina.setCantidad(new BigDecimal("100")); // 100 kg
itemHarina.setStockMinimo(new BigDecimal("10"));
inventarioItemRepository.save(itemHarina);

// Similar para agua y salchichas...
```

### PASO 3: Crear la receta INTERMEDIA (Masa de Banderilla)

```java
// 1. Crear la receta
Receta recetaMasa = new Receta();
recetaMasa.setNombre("Masa de Banderilla");
recetaMasa.setDescripcion("Masa para elaborar banderillas");
recetaMasa.setTiempoPreparacion(30);
recetaMasa.setPorciones(10);
recetaMasa.setTipoReceta(Receta.TipoReceta.INTERMEDIA); // ⭐ IMPORTANTE
recetaMasa.setSucursal(sucursal);
recetaMasa.setActiva(true);
recetaRepository.save(recetaMasa);

// 2. Definir qué produce esta receta
ProductoElaborado masaBanderilla = new ProductoElaborado();
masaBanderilla.setNombre("Masa de Banderilla");
masaBanderilla.setDescripcion("Masa lista para elaborar banderillas");
masaBanderilla.setRecetaOrigen(recetaMasa);
masaBanderilla.setUnidadMedida("porciones");
masaBanderilla.setActivo(true);
productoElaboradoRepository.save(masaBanderilla);

// 3. Vincular el producto con la receta
recetaMasa.setProductoElaborado(masaBanderilla);
recetaRepository.save(recetaMasa);

// 4. Agregar ingredientes a la receta de masa
RecetaIngrediente ingredienteHarina = new RecetaIngrediente();
ingredienteHarina.setReceta(recetaMasa);
ingredienteHarina.setMaterial(harina);
ingredienteHarina.setTipoIngrediente(RecetaIngrediente.TipoIngrediente.MATERIAL);
ingredienteHarina.setCantidadRequerida(new BigDecimal("2.0")); // 2 kg por 10 porciones
recetaIngredienteRepository.save(ingredienteHarina);

RecetaIngrediente ingredienteAgua = new RecetaIngrediente();
ingredienteAgua.setReceta(recetaMasa);
ingredienteAgua.setMaterial(agua);
ingredienteAgua.setTipoIngrediente(RecetaIngrediente.TipoIngrediente.MATERIAL);
ingredienteAgua.setCantidadRequerida(new BigDecimal("1.0")); // 1 litro
recetaIngredienteRepository.save(ingredienteAgua);
```

### PASO 4: Elaborar la masa (guarda el producto en inventario)

```java
// Al elaborar una receta INTERMEDIA, se guarda en el inventario
ProduccionReceta produccionMasa = produccionRecetaService.elaborarReceta(
    recetaMasa.getId(),
    sucursal,
    usuario,
    10  // Producir 10 porciones
);

// ✅ Ahora hay 10 porciones de "Masa de Banderilla" en el inventario
// ✅ Se consumieron 2 kg de harina y 1 litro de agua del inventario
```

### PASO 5: Crear la receta FINAL (Banderillas)

```java
// 1. Crear la receta final
Receta recetaBanderillas = new Receta();
recetaBanderillas.setNombre("Banderillas");
recetaBanderillas.setDescripcion("Banderillas fritas listas para vender");
recetaBanderillas.setTiempoPreparacion(15);
recetaBanderillas.setPorciones(10);
recetaBanderillas.setTipoReceta(Receta.TipoReceta.FINAL); // ⭐ FINAL (no se almacena)
recetaBanderillas.setPrecioVenta(new BigDecimal("5.00"));
recetaBanderillas.setSucursal(sucursal);
recetaBanderillas.setActiva(true);
recetaRepository.save(recetaBanderillas);

// 2. Usar la MASA como ingrediente
RecetaIngrediente ingredienteMasa = new RecetaIngrediente();
ingredienteMasa.setReceta(recetaBanderillas);
ingredienteMasa.setProductoElaborado(masaBanderilla); // ⭐ ProductoElaborado
ingredienteMasa.setTipoIngrediente(RecetaIngrediente.TipoIngrediente.PRODUCTO_ELABORADO);
ingredienteMasa.setCantidadRequerida(new BigDecimal("10")); // 10 porciones de masa
recetaIngredienteRepository.save(ingredienteMasa);

// 3. Agregar salchichas
RecetaIngrediente ingredienteSalchicha = new RecetaIngrediente();
ingredienteSalchicha.setReceta(recetaBanderillas);
ingredienteSalchicha.setMaterial(salchicha);
ingredienteSalchicha.setTipoIngrediente(RecetaIngrediente.TipoIngrediente.MATERIAL);
ingredienteSalchicha.setCantidadRequerida(new BigDecimal("10")); // 10 salchichas
recetaIngredienteRepository.save(ingredienteSalchicha);
```

### PASO 6: Elaborar las banderillas (consume la masa del inventario)

```java
// Verificar que hay masa disponible en inventario
boolean hayInventario = produccionRecetaService.verificarInventarioDisponible(
    recetaBanderillas.getId(),
    sucursal,
    10
);

if (hayInventario) {
    ProduccionReceta produccionBanderillas = produccionRecetaService.elaborarReceta(
        recetaBanderillas.getId(),
        sucursal,
        usuario,
        10  // Producir 10 banderillas
    );
    
    // ✅ Se consumieron 10 porciones de "Masa de Banderilla" del inventario
    // ✅ Se consumieron 10 salchichas del inventario
    // ✅ Como es receta FINAL, NO se agrega al inventario de productos
}
```

---

## Diferencias Clave

| Aspecto | Receta INTERMEDIA | Receta FINAL |
|---------|-------------------|--------------|
| **Uso** | Se usa en otras recetas | Producto para venta |
| **En inventario** | ✅ Se guarda como ProductoElaborado | ❌ No se guarda |
| **ProductoElaborado** | Sí, está vinculado | No tiene |
| **Ejemplo** | Masa, Salsa, Relleno | Banderillas, Pan terminado |

---

## Verificaciones Automáticas

El sistema verifica automáticamente:

1. ✅ **Materiales básicos**: Hay suficiente harina, agua, etc.
2. ✅ **Productos elaborados**: Hay suficiente masa, salsa, etc.
3. ✅ **Orden de producción**: Si falta masa, indica qué receta elaborar primero

```java
// Si intentas elaborar banderillas sin masa:
try {
    produccionRecetaService.elaborarReceta(recetaBanderillas.getId(), ...);
} catch (RuntimeException e) {
    // Error: "Producto elaborado Masa de Banderilla no encontrado en inventario. 
    //         Debe elaborar primero la receta: Masa de Banderilla"
}
```

---

## Flujo de Inventario

```
INVENTARIO INICIAL:
├── Harina: 100 kg
├── Agua: 50 litros
└── Salchichas: 100 unidades

PASO 1: Elaborar "Masa de Banderilla" (10 porciones)
├── ❌ Harina: 100 - 2 = 98 kg
├── ❌ Agua: 50 - 1 = 49 litros
└── ✅ Masa de Banderilla: 0 + 10 = 10 porciones

PASO 2: Elaborar "Banderillas" (10 unidades)
├── ❌ Masa de Banderilla: 10 - 10 = 0 porciones
├── ❌ Salchichas: 100 - 10 = 90 unidades
└── ✅ Banderillas listas para vender (NO se guarda en inventario)
```

---

## Ventajas del Sistema

✅ **Trazabilidad completa**: Sabes exactamente qué materiales se usaron  
✅ **Producción eficiente**: Puedes pre-elaborar masas y usarlas después  
✅ **Control de stock**: Tanto materiales como semi-elaborados  
✅ **Flexibilidad**: Múltiples niveles de recetas anidadas  
✅ **Orden lógico**: El sistema te avisa si falta elaborar algo primero

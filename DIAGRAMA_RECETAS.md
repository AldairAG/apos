# Diagrama Visual: Sistema de Recetas Anidadas

## Ejemplo: Elaboración de Banderillas

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTARIO DE MATERIALES                      │
├─────────────────────────────────────────────────────────────────┤
│  Harina: 100 kg                                                 │
│  Agua: 50 litros                                                │
│  Salchichas: 100 unidades                                       │
│  Aceite: 20 litros                                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│         RECETA NIVEL 1: "Masa de Banderilla" (INTERMEDIA)      │
├─────────────────────────────────────────────────────────────────┤
│  Ingredientes:                                                  │
│    • Harina ─────► 2 kg    (MATERIAL)                          │
│    • Agua ───────► 1 litro (MATERIAL)                          │
│                                                                 │
│  Produce: 10 porciones de "Masa de Banderilla"                 │
│  ✅ Se guarda en inventario como ProductoElaborado             │
└─────────────────────────────────────────────────────────────────┘
                            │ elaborarReceta()
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                INVENTARIO DE PRODUCTOS ELABORADOS                │
├─────────────────────────────────────────────────────────────────┤
│  Masa de Banderilla: 10 porciones ⭐ (nuevo)                    │
└─────────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┴────────────────┐
           ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────┐
│ INVENTARIO MATERIALES│        │ INVENTARIO PRODUCTOS │
├──────────────────────┤        ├──────────────────────┤
│ Harina: 98 kg ❌     │        │ Masa: 10 porc. ✅    │
│ Agua: 49 L ❌        │        └──────────────────────┘
│ Salchichas: 100 ✓    │
│ Aceite: 20 L ✓       │
└──────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           RECETA NIVEL 2: "Banderillas" (FINAL)                │
├─────────────────────────────────────────────────────────────────┤
│  Ingredientes:                                                  │
│    • Masa de Banderilla ─► 10 porciones (PRODUCTO_ELABORADO) ⭐│
│    • Salchichas ─────────► 10 unidades  (MATERIAL)             │
│    • Aceite ─────────────► 0.5 litros   (MATERIAL)             │
│                                                                 │
│  Produce: 10 banderillas                                        │
│  ❌ NO se guarda en inventario (producto final para venta)     │
└─────────────────────────────────────────────────────────────────┘
                            │ elaborarReceta()
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTARIO RESULTANTE                         │
├─────────────────────────────────────────────────────────────────┤
│  MATERIALES:                                                    │
│    Harina: 98 kg                                                │
│    Agua: 49 litros                                              │
│    Salchichas: 90 unidades ❌ (consumidas)                      │
│    Aceite: 19.5 litros ❌ (consumido)                           │
│                                                                 │
│  PRODUCTOS ELABORADOS:                                          │
│    Masa de Banderilla: 0 porciones ❌ (consumidas)              │
│                                                                 │
│  PRODUCCIÓN REGISTRADA:                                         │
│    ✅ 10 Banderillas listas para vender                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos en el Sistema

```
┌──────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Material   │──┐   │ ProductoElaborado│      │     Receta      │
│ (Ingrediente)│  │   │  (Semi-elaborado)│      │  (Fórmula)      │
└──────────────┘  │   └──────────────────┘      └─────────────────┘
                  │            ▲                         │
                  │            │                         │
                  │            │ produce                 │
                  │            │                         │
                  └────────────┼─────────────────────────┘
                               │
                               │ usa
                               │
                    ┌──────────▼──────────┐
                    │ RecetaIngrediente   │
                    │ ┌─────────────────┐ │
                    │ │ tipoIngrediente │ │
                    │ │  • MATERIAL     │ │
                    │ │  • PRODUCTO_... │ │
                    │ └─────────────────┘ │
                    └─────────────────────┘
                               │
                               │ consume/produce
                               ▼
                    ┌─────────────────────┐
                    │    Inventario       │
                    │ ┌─────────────────┐ │
                    │ │ InventarioItem  │ │
                    │ │ (Materiales)    │ │
                    │ └─────────────────┘ │
                    │ ┌─────────────────┐ │
                    │ │InventarioProd.  │ │
                    │ │ (Elaborados)    │ │
                    │ └─────────────────┘ │
                    └─────────────────────┘
```

---

## Tipos de Ingredientes

### 1. MATERIAL (Ingrediente Básico)
```
RecetaIngrediente:
├── material: Material ✅
├── productoElaborado: null
├── tipoIngrediente: MATERIAL
└── cantidadRequerida: 2.0 kg

Ejemplo: Harina, Azúcar, Huevos
```

### 2. PRODUCTO_ELABORADO (Resultado de Otra Receta)
```
RecetaIngrediente:
├── material: null
├── productoElaborado: ProductoElaborado ✅
├── tipoIngrediente: PRODUCTO_ELABORADO
└── cantidadRequerida: 10 porciones

Ejemplo: Masa de Banderilla, Salsa Especial, Relleno
```

---

## Proceso Completo

```
1. COMPRA DE MATERIALES
   Usuario → Compra harina, agua, etc.
   Sistema → Actualiza InventarioItem

2. CREAR RECETA INTERMEDIA
   Usuario → Define "Masa de Banderilla"
   Sistema → Crea Receta (tipo: INTERMEDIA)
   Sistema → Crea ProductoElaborado asociado

3. ELABORAR RECETA INTERMEDIA
   Usuario → Ejecuta elaborarReceta()
   Sistema → ❌ Reduce materiales (InventarioItem)
   Sistema → ✅ Agrega producto (InventarioProducto)

4. CREAR RECETA FINAL
   Usuario → Define "Banderillas"
   Sistema → Crea Receta (tipo: FINAL)
   Usuario → Agrega "Masa" como ingrediente (PRODUCTO_ELABORADO)

5. ELABORAR RECETA FINAL
   Usuario → Ejecuta elaborarReceta()
   Sistema → ❌ Reduce productos elaborados (InventarioProducto)
   Sistema → ❌ Reduce materiales (InventarioItem)
   Sistema → ✅ NO agrega al inventario (es producto final)
   Sistema → ✅ Registra en ProduccionReceta

6. VENTA
   Usuario → Vende las banderillas
   [Otro módulo maneja ventas]
```

---

## Ventajas del Sistema de Niveles

✅ **Eficiencia**: Pre-elabora masas en lote  
✅ **Flexibilidad**: Usa la misma masa en varias recetas  
✅ **Control**: Inventario separado de materiales y productos  
✅ **Trazabilidad**: Sabes exactamente qué se usó en cada nivel  
✅ **Optimización**: Identifica cuellos de botella en producción

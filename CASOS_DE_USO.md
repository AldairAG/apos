# Casos de Uso - Sistema APOS (Sistema de Punto de Venta)

## 📋 Índice
1. [Gestión de Usuarios](#1-gestión-de-usuarios)
2. [Gestión de Sucursales](#2-gestión-de-sucursales)
3. [Gestión de Inventario - Materiales](#3-gestión-de-inventario---materiales)
4. [Gestión de Inventario - Productos Elaborados](#4-gestión-de-inventario---productos-elaborados)
5. [Gestión de Recetas](#5-gestión-de-recetas)
6. [Producción de Recetas](#6-producción-de-recetas)

---

## 1. Gestión de Usuarios

### CU-001: Registro de Usuario
**Actor**: Usuario Nuevo  
**Descripción**: Un usuario se registra en el sistema creando una cuenta

**Precondiciones**:
- El email no debe estar registrado previamente

**Flujo Principal**:
1. Usuario ingresa email y contraseña
2. Sistema valida que el email no exista
3. Sistema crea la cuenta con rol ADMINISTRADOR por defecto
4. Sistema genera token JWT
5. Sistema retorna datos del usuario y token

**Postcondiciones**:
- Usuario registrado en el sistema
- Usuario puede acceder con sus credenciales

---

### CU-002: Inicio de Sesión
**Actor**: Usuario Registrado  
**Descripción**: Usuario accede al sistema con sus credenciales

**Precondiciones**:
- Usuario debe estar registrado
- Cuenta debe estar activa

**Flujo Principal**:
1. Usuario ingresa email y contraseña
2. Sistema valida credenciales
3. Sistema genera token JWT
4. Sistema retorna datos del usuario, token y sucursales asociadas

**Postcondiciones**:
- Usuario autenticado en el sistema
- Token JWT válido para futuras peticiones

---

## 2. Gestión de Sucursales

### CU-003: Crear Sucursal
**Actor**: Usuario Administrador  
**Descripción**: Usuario crea una nueva sucursal de negocio

**Precondiciones**:
- Usuario debe estar autenticado
- Usuario debe tener rol ADMINISTRADOR o GERENTE

**Flujo Principal**:
1. Usuario ingresa datos de la sucursal (nombre, dirección, teléfono, propietario)
2. Sistema valida los datos
3. Sistema crea la sucursal
4. Sistema crea automáticamente un inventario vacío para la sucursal
5. Sistema asocia la sucursal al usuario
6. Sistema retorna la sucursal creada

**Postcondiciones**:
- Sucursal creada en el sistema
- Inventario inicializado
- Usuario asociado a la sucursal

---

### CU-004: Listar Sucursales del Usuario
**Actor**: Usuario  
**Descripción**: Usuario obtiene la lista de sucursales a las que tiene acceso

**Precondiciones**:
- Usuario debe estar autenticado

**Flujo Principal**:
1. Usuario solicita sus sucursales
2. Sistema retorna lista de sucursales asociadas al usuario

**Postcondiciones**:
- Usuario visualiza sus sucursales disponibles

---

### CU-005: Eliminar Sucursal
**Actor**: Usuario Administrador  
**Descripción**: Usuario elimina una sucursal del sistema

**Precondiciones**:
- Usuario debe estar autenticado
- Sucursal debe existir
- Usuario debe tener permisos

**Flujo Principal**:
1. Usuario selecciona sucursal a eliminar
2. Sistema valida permisos
3. Sistema elimina la sucursal
4. Sistema elimina inventario asociado (cascada)
5. Sistema confirma eliminación

**Postcondiciones**:
- Sucursal eliminada del sistema
- Inventario eliminado

---

## 3. Gestión de Inventario - Materiales

### CU-006: Agregar Material Nuevo al Inventario
**Actor**: Administrador/Gerente  
**Descripción**: Agregar un material completamente nuevo al catálogo y al inventario

**Precondiciones**:
- Usuario autenticado
- Sucursal debe tener inventario inicializado

**Flujo Principal**:
1. Usuario ingresa datos del material:
   - Nombre (ej: "Harina de Trigo")
   - Descripción
   - Tipo de material (INGREDIENTE, EMPAQUE, INSUMO)
   - Tipo de unidad (KILOGRAMOS, LITROS, UNIDADES)
   - Precio por paquete
   - Cantidad por paquete
2. Usuario ingresa datos de stock:
   - Cantidad inicial
   - Stock mínimo
   - Stock máximo
   - Precio unitario
3. Sistema crea el Material en el catálogo global
4. Sistema crea el InventarioItem vinculado al inventario
5. Sistema registra fecha de actualización

**Postcondiciones**:
- Material creado en catálogo global
- Item agregado al inventario de la sucursal
- Stock registrado

**Flujo Alternativo**: Material ya existe
1. Usuario proporciona ID de material existente
2. Sistema solo crea el InventarioItem (no duplica el Material)
3. Permite diferentes precios por sucursal

---

### CU-007: Actualizar Stock de Material
**Actor**: Empleado/Gerente  
**Descripción**: Modificar cantidades de un material en inventario

**Precondiciones**:
- Material debe existir en el inventario
- Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona material a actualizar
2. Usuario modifica:
   - Cantidad en stock
   - Precio unitario
   - Stocks mínimo/máximo
3. Sistema actualiza el InventarioItem
4. Sistema registra fecha de actualización

**Postcondiciones**:
- Stock actualizado
- Fecha de última actualización registrada

**Casos de Uso**:
- Registro de compra (aumenta stock)
- Registro de consumo (disminuye stock)
- Ajuste de inventario
- Actualización de precios

---

### CU-008: Consultar Inventario de Materiales
**Actor**: Cualquier usuario autorizado  
**Descripción**: Ver todos los materiales en inventario de una sucursal

**Precondiciones**:
- Usuario autenticado
- Usuario asociado a la sucursal

**Flujo Principal**:
1. Usuario selecciona sucursal
2. Sistema retorna inventario completo con:
   - Lista de materiales (InventarioItem)
   - Cantidades actuales
   - Información del material (nombre, tipo, unidad)
   - Stocks mínimo/máximo
   - Precios

**Postcondiciones**:
- Usuario visualiza estado del inventario

---

### CU-009: Alertas de Stock Bajo - Materiales
**Actor**: Sistema/Gerente  
**Descripción**: Identificar materiales que requieren reabastecimiento

**Precondiciones**:
- Inventario inicializado
- Items con stock mínimo configurado

**Flujo Principal**:
1. Usuario solicita reporte de stock bajo
2. Sistema compara cantidad actual vs stock mínimo
3. Sistema retorna lista de materiales donde cantidad < stockMinimo
4. Usuario visualiza alertas de reabastecimiento

**Postcondiciones**:
- Gerente identifica materiales a reponer

---

### CU-010: Eliminar Material del Inventario
**Actor**: Administrador  
**Descripción**: Eliminar un material del inventario de la sucursal

**Precondiciones**:
- Material existe en inventario
- Usuario autenticado con permisos

**Flujo Principal**:
1. Usuario selecciona material a eliminar
2. Sistema valida que no esté en uso en recetas activas
3. Sistema elimina InventarioItem
4. Sistema confirma eliminación

**Postcondiciones**:
- Material removido del inventario
- Material sigue existiendo en catálogo global

**Nota**: No elimina el Material del catálogo, solo del inventario de esa sucursal.

---

## 4. Gestión de Inventario - Productos Elaborados

### CU-011: Agregar Producto Elaborado al Inventario
**Actor**: Administrador/Gerente  
**Descripción**: Agregar un producto elaborado nuevo al inventario de la sucursal

**Endpoint**: `POST /api/inventario/{inventarioId}/productos-elaborados`

**Precondiciones**:
- Usuario autenticado
- Inventario debe existir

**Flujo Principal**:
1. Usuario ingresa datos del producto elaborado:
   - Opción A: ID de producto elaborado existente
   - Opción B: Crear nuevo producto (nombre, descripción, unidad de medida, receta origen)
2. Usuario especifica stock inicial y stock mínimo
3. Sistema valida que el producto no exista ya en el inventario
4. Sistema crea o asocia el ProductoElaborado
5. Sistema crea el InventarioProducto vinculado al inventario
6. Sistema registra fecha de actualización

**Request Body**:
```json
{
  "productoElaboradoId": null,  // Si existe, usar este ID
  "nombre": "Masa de Banderilla",
  "descripcion": "Masa preparada para banderillas",
  "recetaOrigenId": 5,
  "unidadMedida": "UNIDADES",
  "cantidad": 0.0,
  "stockMinimo": 5.0
}
```

**Postcondiciones**:
- ProductoElaborado agregado al inventario
- Stock registrado y listo para usar

**Flujo Alternativo**: Producto ya existe
- Sistema rechaza la operación si el producto ya está en el inventario
- Usuario debe usar actualización de stock en su lugar

---

### CU-011b: Incrementar Stock de Producto Elaborado (Automático)
**Actor**: Sistema (automático al producir receta INTERMEDIA)  
**Descripción**: Al producir una receta intermedia, el resultado se guarda automáticamente en inventario

**Método del Servicio**: `incrementarStockProducto(inventarioId, productoElaboradoId, cantidad)`

**Precondiciones**:
- Receta tipo INTERMEDIA existe
- Receta tiene ProductoElaborado asociado
- Materiales/productos necesarios disponibles

**Flujo Principal**:
1. Sistema produce receta intermedia (ver CU-024)
2. Sistema busca o crea InventarioProducto para ese ProductoElaborado
3. Sistema incrementa cantidad en inventario
4. Sistema actualiza fechaUltimaProduccion
5. Sistema descuenta materiales/productos consumidos

**Postcondiciones**:
- ProductoElaborado agregado/incrementado en inventario
- Disponible para usar en otras recetas

**Ejemplo**: Producir 10 porciones de "Masa de Banderilla" agrega 10 al inventario.

---

### CU-012: Actualizar Stock de Producto Elaborado
**Actor**: Empleado/Gerente  
**Descripción**: Modificar cantidades y configuración de un producto elaborado

**Endpoint**: `PUT /api/inventario/productos-elaborados/{inventarioProductoId}`

**Precondiciones**:
- Producto elaborado existe en inventario
- Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona producto elaborado a actualizar
2. Usuario modifica:
   - Cantidad en stock
   - Stock mínimo
3. Sistema actualiza el InventarioProducto
4. Sistema registra fecha de actualización

**Request Body**:
```json
{
  "cantidad": 15.0,
  "stockMinimo": 10.0
}
```

**Postcondiciones**:
- Stock actualizado
- Fecha de última actualización registrada

**Casos de Uso**:
- Ajuste de inventario físico
- Corrección de errores de registro
- Actualización de stock mínimo requerido

---

### CU-012b: Consumir Producto Elaborado (Automático)
**Actor**: Sistema (automático al producir receta FINAL)  
**Descripción**: Al producir una receta final que usa productos elaborados, se consumen del inventario

**Método del Servicio**: `consumirProductoElaborado(inventarioId, productoElaboradoId, cantidad)`

**Precondiciones**:
- ProductoElaborado existe en inventario
- Cantidad suficiente disponible

**Flujo Principal**:
1. Sistema valida disponibilidad del producto elaborado
2. Sistema descuenta cantidad requerida del InventarioProducto
3. Sistema actualiza fechaUltimaActualizacion
4. Si cantidad llega a 0, mantiene el registro para historial

**Postcondiciones**:
- Cantidad de ProductoElaborado reducida

**Flujo Alternativo**: Stock insuficiente
- Sistema lanza excepción indicando stock disponible vs requerido
- Usuario debe producir más del producto intermedio primero

**Ejemplo**: Al hacer 10 Banderillas que requieren 10 porciones de Masa, se descuentan del inventario.

---

### CU-013: Consultar Productos Elaborados en Inventario
**Actor**: Chef/Gerente  
**Descripción**: Ver todos los productos elaborados disponibles en el inventario

**Endpoint**: `GET /api/inventario/{inventarioId}/productos-elaborados`

**Precondiciones**:
- Usuario autenticado
- Inventario inicializado

**Flujo Principal**:
1. Usuario solicita lista de productos elaborados
2. Sistema retorna lista completa con:
   - ID del inventario producto
   - Nombre del producto elaborado
   - Descripción
   - Unidad de medida
   - Cantidad disponible
   - Stock mínimo
   - Receta origen (ID y nombre)
   - Fecha última actualización
   - Fecha última producción

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "inventarioProductoId": 1,
      "productoElaboradoId": 1,
      "nombre": "Masa de Banderilla",
      "descripcion": "Masa preparada para banderillas",
      "unidadMedida": "UNIDADES",
      "cantidad": 15.0,
      "stockMinimo": 10.0,
      "recetaOrigenId": 5,
      "recetaOrigenNombre": "Receta Masa Banderilla",
      "fechaUltimaActualizacion": "2026-04-10T14:30:00",
      "fechaUltimaProduccion": "2026-04-10T10:15:00"
    }
  ],
  "message": null
}
```

**Postcondiciones**:
- Usuario conoce disponibilidad de todos los productos elaborados

---

### CU-014: Alertas de Stock Bajo - Productos Elaborados
**Actor**: Sistema/Chef  
**Descripción**: Identificar productos elaborados que necesitan producirse

**Endpoint**: `GET /api/inventario/{inventarioId}/productos-elaborados/stock-bajo`

**Precondiciones**:
- Productos elaborados con stock mínimo configurado

**Flujo Principal**:
1. Usuario solicita alertas de productos elaborados
2. Sistema compara cantidad vs stockMinimo para cada producto
3. Sistema filtra productos donde cantidad < stockMinimo
4. Sistema calcula déficit (stockMinimo - cantidad)
5. Sistema retorna lista con:
   - Productos con stock bajo
   - Déficit de cantidad
   - Receta recomendada a producir

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "inventarioProductoId": 1,
      "productoElaboradoId": 1,
      "nombre": "Masa de Banderilla",
      "cantidad": 3.0,
      "stockMinimo": 10.0,
      "deficit": 7.0,
      "recetaOrigenId": 5,
      "recetaOrigenNombre": "Receta Masa Banderilla"
    }
  ],
  "message": null
}
```

**Postcondiciones**:
- Chef sabe qué recetas intermedias debe producir

**Ejemplo**: "Masa de Banderilla: 3 disponibles, mínimo 10. Déficit: 7. Producir receta: Masa de Banderilla"

---

### CU-015: Consultar Detalle de Producto Elaborado
**Actor**: Chef/Gerente  
**Descripción**: Ver información detallada de un producto elaborado específico

**Endpoint**: `GET /api/inventario/productos-elaborados/{inventarioProductoId}`

**Precondiciones**:
- Usuario autenticado
- Producto elaborado existe en inventario

**Flujo Principal**:
1. Usuario selecciona producto elaborado
2. Sistema retorna información completa:
   - Todos los datos del producto
   - Stock actual y mínimo
   - Historial de fechas
   - Receta origen asociada

**Postcondiciones**:
- Usuario visualiza información completa del producto

---

### CU-016: Eliminar Producto Elaborado del Inventario
**Actor**: Administrador  
**Descripción**: Eliminar un producto elaborado del inventario de la sucursal

**Endpoint**: `DELETE /api/inventario/productos-elaborados/{inventarioProductoId}`

**Precondiciones**:
- Producto elaborado existe en inventario
- Usuario autenticado con permisos

**Flujo Principal**:
1. Usuario selecciona producto elaborado a eliminar
2. Sistema valida permisos
3. Sistema elimina InventarioProducto
4. Sistema confirma eliminación

**Postcondiciones**:
- Producto removido del inventario
- ProductoElaborado sigue existiendo en catálogo global

**Nota**: No elimina el ProductoElaborado del catálogo, solo del inventario de esa sucursal.

---

## 5. Gestión de Recetas

### CU-017: Crear Receta Intermedia (Producto Almacenable)
**Actor**: Chef/Administrador  
**Descripción**: Crear una receta cuyo resultado se almacena en inventario

**Precondiciones**:
- Usuario autenticado
- Materiales necesarios existen en catálogo

**Flujo Principal**:
1. Usuario define datos de la receta:
   - Nombre (ej: "Masa de Banderilla")
   - Descripción
   - Tiempo de preparación
   - Porciones que produce
   - Tipo: INTERMEDIA
2. Usuario define producto elaborado resultante:
   - Nombre del producto
   - Unidad de medida (porciones, litros, kilos)
3. Usuario agrega ingredientes (solo MATERIAL):
   - Material ID
   - Cantidad requerida
   - Notas
4. Sistema vincula ProductoElaborado con la Receta
5. Sistema guarda receta como activa

**Postcondiciones**:
- Receta INTERMEDIA creada
- ProductoElaborado creado y vinculado
- Receta disponible para producción
- Producto puede usarse en otras recetas

**Ejemplo**: Receta "Masa de Banderilla" usa harina y agua, produce masa.

---

### CU-018: Crear Receta Final (Producto para Venta)
**Actor**: Chef/Administrador  
**Descripción**: Crear una receta de producto final que no se almacena

**Precondiciones**:
- Usuario autenticado
- Ingredientes (materiales y/o productos elaborados) existen

**Flujo Principal**:
1. Usuario define datos de la receta:
   - Nombre (ej: "Banderillas")
   - Descripción
   - Tiempo de preparación
   - Porciones
   - Precio de venta
   - Tipo: FINAL
2. Usuario agrega ingredientes mixtos:
   - MATERIAL: ej. Salchichas (materialId)
   - PRODUCTO_ELABORADO: ej. Masa de Banderilla (productoElaboradoId)
   - Cantidad requerida para cada uno
3. Sistema valida que los productos elaborados existan
4. Sistema crea receta sin ProductoElaborado asociado
5. Sistema guarda receta como activa

**Postcondiciones**:
- Receta FINAL creada
- Puede usar productos elaborados como ingredientes
- Al producirla, NO se guarda en inventario

**Ejemplo**: Receta "Banderillas" usa Masa de Banderilla (producto elaborado) + Salchichas (material).

---

### CU-019: Actualizar Receta
**Actor**: Chef/Administrador  
**Descripción**: Modificar una receta existente

**Precondiciones**:
- Receta debe existir
- Usuario con permisos

**Flujo Principal**:
1. Usuario selecciona receta a actualizar
2. Usuario modifica:
   - Datos generales (nombre, descripción, tiempo, porciones)
   - Lista de ingredientes
   - Precio de venta (si es FINAL)
3. Sistema elimina ingredientes anteriores
4. Sistema crea nuevos ingredientes
5. Sistema actualiza fecha de modificación

**Postcondiciones**:
- Receta actualizada
- Nuevos ingredientes registrados

**Flujo Alternativo**: Receta en uso
- Sistema puede advertir si la receta tiene producciones recientes

---

### CU-020: Listar Recetas de Sucursal
**Actor**: Chef/Cualquier usuario  
**Descripción**: Obtener lista de recetas disponibles

**Precondiciones**:
- Usuario autenticado
- Sucursal existe

**Flujo Principal**:
1. Usuario solicita recetas de una sucursal
2. Usuario puede filtrar:
   - Todas las recetas
   - Solo activas
   - Por tipo (INTERMEDIA/FINAL)
3. Sistema retorna lista con:
   - Datos de la receta
   - Ingredientes
   - Producto elaborado (si es INTERMEDIA)

**Postcondiciones**:
- Usuario visualiza recetas disponibles

---

### CU-021: Activar/Desactivar Receta
**Actor**: Administrador/Chef  
**Descripción**: Cambiar el estado activo de una receta

**Precondiciones**:
- Receta existe
- Usuario con permisos

**Flujo Principal**:
1. Usuario selecciona receta
2. Usuario establece estado (activa/inactiva)
3. Sistema actualiza campo activa
4. Sistema retorna receta actualizada

**Postcondiciones**:
- Receta con nuevo estado
- Si está inactiva, no aparece en producción

**Casos de Uso**:
- Desactivar recetas de temporada
- Desactivar recetas con ingredientes discontinuados

---

### CU-022: Eliminar Receta
**Actor**: Administrador  
**Descripción**: Eliminar permanentemente una receta

**Precondiciones**:
- Receta existe
- Usuario con permisos de administrador

**Flujo Principal**:
1. Usuario selecciona receta a eliminar
2. Sistema valida dependencias:
   - Si es INTERMEDIA, verifica que su ProductoElaborado no se use en otras recetas
3. Sistema elimina ingredientes (cascada)
4. Sistema elimina receta
5. Sistema confirma eliminación

**Postcondiciones**:
- Receta eliminada del sistema
- Ingredientes eliminados

**Flujo Alternativo**: Receta en uso
- Sistema rechaza eliminación si el ProductoElaborado se usa en otras recetas activas

---

## 6. Producción de Recetas

### CU-023: Verificar Disponibilidad de Ingredientes
**Actor**: Chef/Sistema  
**Descripción**: Validar que todos los ingredientes estén disponibles antes de producir

**Precondiciones**:
- Receta existe
- Inventario inicializado

**Flujo Principal**:
1. Usuario solicita verificación para una receta y cantidad
2. Sistema verifica cada ingrediente:
   - Si es MATERIAL: busca en InventarioItem
   - Si es PRODUCTO_ELABORADO: busca en InventarioProducto
3. Sistema compara cantidad requerida vs disponible
4. Sistema retorna reporte detallado:
   - Ingredientes suficientes ✅
   - Ingredientes faltantes ❌ con déficit

**Postcondiciones**:
- Usuario sabe si puede producir
- Si faltan productos elaborados, sistema indica qué receta producir primero

**Ejemplo**:
- Para hacer 10 Banderillas necesito:
  - 10 porciones de Masa → Disponible: 0 ❌ → Producir primero: "Masa de Banderilla"
  - 10 Salchichas → Disponible: 90 ✅

---

### CU-024: Producir Receta Intermedia
**Actor**: Chef  
**Descripción**: Elaborar una receta intermedia, guardando el resultado en inventario

**Precondiciones**:
- Receta INTERMEDIA existe
- Ingredientes disponibles
- Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona receta intermedia a producir
2. Usuario especifica cantidad a producir
3. Sistema verifica disponibilidad de ingredientes
4. Sistema descuenta materiales del InventarioItem
5. Sistema agrega resultado al InventarioProducto:
   - Incrementa cantidad
   - Actualiza fechaUltimaProduccion
6. Sistema registra ProduccionReceta:
   - Receta, cantidad, usuario, fecha, observaciones
7. Sistema retorna confirmación con inventario actualizado

**Postcondiciones**:
- Materiales descontados del inventario
- ProductoElaborado agregado al inventario
- Producción registrada para trazabilidad

**Ejemplo**:
- Producir 10 porciones de "Masa de Banderilla"
- Descuenta: 2kg Harina, 1L Agua
- Agrega: +10 porciones de Masa al InventarioProducto

---

### CU-025: Producir Receta Final
**Actor**: Chef  
**Descripción**: Elaborar una receta final, consumiendo inventario sin guardar resultado

**Precondiciones**:
- Receta FINAL existe
- Ingredientes disponibles (materiales + productos elaborados)
- Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona receta final a producir
2. Usuario especifica cantidad
3. Sistema verifica disponibilidad:
   - Materiales en InventarioItem
   - Productos elaborados en InventarioProducto
4. Sistema descuenta de inventarios:
   - InventarioItem (materiales)
   - InventarioProducto (productos elaborados)
5. Sistema NO agrega nada al inventario (es producto final)
6. Sistema registra ProduccionReceta para costos
7. Sistema retorna confirmación con inventario actualizado

**Postcondiciones**:
- Ingredientes descontados
- Producto final listo para vender (no en inventario)
- Producción registrada

**Ejemplo**:
- Producir 10 Banderillas
- Descuenta: 10 porciones Masa, 10 Salchichas, 0.5L Aceite
- NO agrega nada al inventario (producto final para venta)

---

### CU-026: Producción en Cascada (Recetas Anidadas)
**Actor**: Chef  
**Descripción**: Producir una receta que requiere productos elaborados no disponibles

**Precondiciones**:
- Receta FINAL existe
- Faltan productos elaborados
- Materiales para producir intermedios disponibles

**Flujo Principal**:
1. Usuario intenta producir receta final (ej: Banderillas)
2. Sistema detecta que falta ProductoElaborado (ej: Masa)
3. Sistema notifica al usuario:
   - "Falta Masa de Banderilla"
   - "Debe producir primero receta: Masa de Banderilla"
4. Usuario produce primero la receta intermedia (CU-024)
5. Sistema agrega producto elaborado al inventario
6. Usuario ahora puede producir la receta final (CU-025)

**Postcondiciones**:
- Productos intermedios producidos y almacenados
- Receta final producida exitosamente

**Flujo Automático** (futuro):
- Sistema podría calcular y producir automáticamente recetas intermedias faltantes

---

### CU-027: Consultar Historial de Producción
**Actor**: Administrador/Gerente  
**Descripción**: Ver registro histórico de recetas elaboradas

**Precondiciones**:
- Usuario autenticado
- Producciones registradas

**Flujo Principal**:
1. Usuario solicita historial de producción
2. Usuario puede filtrar por:
   - Sucursal
   - Rango de fechas
   - Receta específica
   - Usuario que produjo
3. Sistema retorna lista de ProduccionReceta con:
   - Receta elaborada
   - Cantidad producida
   - Usuario responsable
   - Fecha y hora
   - Ingredientes consumidos
   - Observaciones

**Postcondiciones**:
- Usuario visualiza histórico de producción

**Casos de Uso**:
- Análisis de costos de producción
- Seguimiento de productividad
- Auditoría de inventario
- Cálculo de rentabilidad por receta

---

## 🎯 Resumen de Actores y Roles

| Rol | Permisos Principales |
|-----|---------------------|
| **ADMINISTRADOR** | Acceso total: crear sucursales, usuarios, recetas, inventario |
| **GERENTE** | Gestión de inventario, recetas, producción de su sucursal |
| **COCINA** | Producir recetas, consultar inventario |
| **MESERO** | Consultar recetas para toma de pedidos (futuro) |

---

## 📊 Flujos de Trabajo Típicos

### Flujo: Configuración Inicial de Nueva Sucursal
```
1. Registro de Usuario (CU-001)
2. Login (CU-002)
3. Crear Sucursal (CU-003)
4. Agregar Materiales al Inventario (CU-006)
5. Crear Recetas Intermedias (CU-017)
6. Crear Recetas Finales (CU-018)
7. Sistema listo para operar
```

### Flujo: Producción Diaria de Banderillas
```
1. Verificar Ingredientes (CU-023)
   └─ Falta Masa de Banderilla
2. Producir Masa (CU-024)
   └─ Descuenta: Harina, Agua
   └─ Agrega: 10 porciones Masa a inventario
3. Producir Banderillas (CU-025)
   └─ Descuenta: Masa, Salchichas, Aceite
   └─ Producto final para venta
4. Consultar Historial (CU-027)
   └─ Verificar costos y producción
```

### Flujo: Gestión de Inventario
```
1. Consultar Inventario (CU-008)
2. Revisar Alertas de Stock Bajo (CU-009)
3. Comprar Materiales Faltantes
4. Actualizar Stock (CU-007)
5. Revisar Productos Elaborados (CU-013, CU-014)
6. Producir Recetas Intermedias Faltantes (CU-024)
```

---

## 🔐 Consideraciones de Seguridad

### Autenticación y Autorización
- Todos los endpoints requieren autenticación excepto registro y login
- Token JWT debe incluirse en header `Authorization: Bearer {token}`
- Tokens expiran después de cierto tiempo (configurado en backend)

### Validaciones
- Email único por usuario
- Nombres de sucursal únicos por usuario
- No se puede eliminar receta si está en uso
- Verificación de stock antes de producir
- Validación de permisos por rol

---

## 📡 Resumen de Endpoints - Productos Elaborados

### Gestión de Productos Elaborados en Inventario

| Método | Endpoint | Descripción | Caso de Uso |
|--------|----------|-------------|-------------|
| POST | `/api/inventario/{inventarioId}/productos-elaborados` | Agregar producto elaborado al inventario | CU-011 |
| PUT | `/api/inventario/productos-elaborados/{inventarioProductoId}` | Actualizar stock de producto elaborado | CU-012 |
| DELETE | `/api/inventario/productos-elaborados/{inventarioProductoId}` | Eliminar producto elaborado del inventario | CU-016 |
| GET | `/api/inventario/{inventarioId}/productos-elaborados` | Listar productos elaborados del inventario | CU-013 |
| GET | `/api/inventario/{inventarioId}/productos-elaborados/stock-bajo` | Obtener alertas de stock bajo | CU-014 |
| GET | `/api/inventario/productos-elaborados/{inventarioProductoId}` | Consultar detalle de un producto elaborado | CU-015 |

### Ejemplos de Uso

#### 1. Agregar Producto Elaborado
```http
POST /api/inventario/1/productos-elaborados
Content-Type: application/json

{
  "nombre": "Masa de Banderilla",
  "descripcion": "Masa preparada para banderillas",
  "recetaOrigenId": 5,
  "unidadMedida": "UNIDADES",
  "cantidad": 0.0,
  "stockMinimo": 10.0
}
```

#### 2. Actualizar Stock
```http
PUT /api/inventario/productos-elaborados/1
Content-Type: application/json

{
  "cantidad": 25.0,
  "stockMinimo": 15.0
}
```

#### 3. Consultar Alertas de Stock Bajo
```http
GET /api/inventario/1/productos-elaborados/stock-bajo
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "inventarioProductoId": 1,
      "productoElaboradoId": 1,
      "nombre": "Masa de Banderilla",
      "cantidad": 5.0,
      "stockMinimo": 15.0,
      "deficit": 10.0,
      "recetaOrigenId": 5,
      "recetaOrigenNombre": "Receta Masa Banderilla"
    }
  ],
  "message": null
}
```

---

**Versión**: 1.1  
**Última actualización**: Abril 10, 2026  
**Autor**: Equipo Backend APOS

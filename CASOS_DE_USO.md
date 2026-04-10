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

### CU-011: Registrar Producto Elaborado en Inventario
**Actor**: Sistema (automático al producir receta INTERMEDIA)  
**Descripción**: Al producir una receta intermedia, el resultado se guarda en inventario

**Precondiciones**:
- Receta tipo INTERMEDIA existe
- Receta tiene ProductoElaborado asociado
- Materiales/productos necesarios disponibles

**Flujo Principal**:
1. Sistema produce receta intermedia (ver CU-018)
2. Sistema busca o crea InventarioProducto para ese ProductoElaborado
3. Sistema incrementa cantidad en inventario
4. Sistema actualiza fechaUltimaProduccion
5. Sistema descuenta materiales/productos consumidos

**Postcondiciones**:
- ProductoElaborado agregado/incrementado en inventario
- Disponible para usar en otras recetas

**Ejemplo**: Producir 10 porciones de "Masa de Banderilla" agrega 10 al inventario.

---

### CU-012: Consumir Producto Elaborado
**Actor**: Sistema (automático al producir receta FINAL)  
**Descripción**: Al producir una receta final que usa productos elaborados, se consumen del inventario

**Precondiciones**:
- ProductoElaborado existe en inventario
- Cantidad suficiente disponible

**Flujo Principal**:
1. Sistema valida disponibilidad del producto elaborado
2. Sistema descuenta cantidad requerida del InventarioProducto
3. Sistema actualiza fechaUltimaActualizacion
4. Si cantidad llega a 0, puede mantener o eliminar el registro

**Postcondiciones**:
- Cantidad de ProductoElaborado reducida

**Ejemplo**: Al hacer 10 Banderillas que requieren 10 porciones de Masa, se descuentan del inventario.

---

### CU-013: Consultar Productos Elaborados en Inventario
**Actor**: Chef/Gerente  
**Descripción**: Ver qué productos elaborados están disponibles

**Precondiciones**:
- Usuario autenticado
- Inventario inicializado

**Flujo Principal**:
1. Usuario consulta inventario de productos elaborados
2. Sistema retorna lista de InventarioProducto con:
   - Nombre del producto elaborado
   - Cantidad disponible
   - Stock mínimo
   - Receta origen
   - Fecha última producción

**Postcondiciones**:
- Usuario conoce disponibilidad de productos elaborados

---

### CU-014: Alertas de Stock Bajo - Productos Elaborados
**Actor**: Sistema/Chef  
**Descripción**: Identificar productos elaborados que necesitan producirse

**Precondiciones**:
- Productos elaborados con stock mínimo configurado

**Flujo Principal**:
1. Usuario solicita alertas de productos elaborados
2. Sistema compara cantidad vs stockMinimo
3. Sistema retorna lista con:
   - Productos con stock bajo
   - Déficit de cantidad
   - Receta recomendada a producir

**Postcondiciones**:
- Chef sabe qué recetas intermedias debe producir

**Ejemplo**: "Masa de Banderilla: 0 disponibles, mínimo 5. Producir receta: Masa de Banderilla"

---

## 5. Gestión de Recetas

### CU-015: Crear Receta Intermedia (Producto Almacenable)
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

### CU-016: Crear Receta Final (Producto para Venta)
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

### CU-017: Actualizar Receta
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

### CU-018: Listar Recetas de Sucursal
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

### CU-019: Activar/Desactivar Receta
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

### CU-020: Eliminar Receta
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

### CU-021: Verificar Disponibilidad de Ingredientes
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

### CU-022: Producir Receta Intermedia
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

### CU-023: Producir Receta Final
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

### CU-024: Producción en Cascada (Recetas Anidadas)
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
4. Usuario produce primero la receta intermedia (CU-022)
5. Sistema agrega producto elaborado al inventario
6. Usuario ahora puede producir la receta final (CU-023)

**Postcondiciones**:
- Productos intermedios producidos y almacenados
- Receta final producida exitosamente

**Flujo Automático** (futuro):
- Sistema podría calcular y producir automáticamente recetas intermedias faltantes

---

### CU-025: Consultar Historial de Producción
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
5. Crear Recetas Intermedias (CU-015)
6. Crear Recetas Finales (CU-016)
7. Sistema listo para operar
```

### Flujo: Producción Diaria de Banderillas
```
1. Verificar Ingredientes (CU-021)
   └─ Falta Masa de Banderilla
2. Producir Masa (CU-022)
   └─ Descuenta: Harina, Agua
   └─ Agrega: 10 porciones Masa a inventario
3. Producir Banderillas (CU-023)
   └─ Descuenta: Masa, Salchichas, Aceite
   └─ Producto final para venta
4. Consultar Historial (CU-025)
   └─ Verificar costos y producción
```

### Flujo: Gestión de Inventario
```
1. Consultar Inventario (CU-008)
2. Revisar Alertas de Stock Bajo (CU-009)
3. Comprar Materiales Faltantes
4. Actualizar Stock (CU-007)
5. Revisar Productos Elaborados (CU-013, CU-014)
6. Producir Recetas Intermedias Faltantes (CU-022)
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

**Versión**: 1.0  
**Última actualización**: Abril 2026  
**Autor**: Equipo Backend APOS

# API REST - Guía de Endpoints

## 📚 Índice de Controladores

1. [MaterialController](#materialcontroller) - Gestión de materiales (ingredientes, insumos)
2. [InventarioController](#inventariocontroller) - Control de stock por sucursal
3. [RecetaController](#recetacontroller) - Gestión de recetas e ingredientes
4. [ProduccionRecetaController](#produccionrecetacontroller) - Elaboración y trazabilidad

---

## MaterialController

**Base URL:** `/api/materiales`

### GET - Obtener todos los materiales
```http
GET /api/materiales
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Harina de Trigo",
      "descripcion": "Harina refinada",
      "tipoMaterial": "INGREDIENTE",
      "tipoUnidad": "KILOGRAMOS",
      "activo": true
    }
  ],
  "message": "Materiales obtenidos exitosamente"
}
```

### GET - Obtener materiales activos
```http
GET /api/materiales/activos
```

### GET - Obtener material por ID
```http
GET /api/materiales/{id}
```

### POST - Crear nuevo material
```http
POST /api/materiales
Content-Type: application/json

{
  "nombre": "Azúcar",
  "descripcion": "Azúcar blanca refinada",
  "tipoMaterial": "INGREDIENTE",
  "tipoUnidad": "KILOGRAMOS",
  "activo": true
}
```

### PUT - Actualizar material
```http
PUT /api/materiales/{id}
Content-Type: application/json

{
  "nombre": "Azúcar Morena",
  "descripcion": "Azúcar morena orgánica",
  "tipoMaterial": "INGREDIENTE",
  "tipoUnidad": "KILOGRAMOS",
  "activo": true
}
```

### DELETE - Desactivar material
```http
DELETE /api/materiales/{id}
```
**Nota:** No elimina físicamente, solo desactiva (soft delete)

---

## InventarioController

**Base URL:** `/api/inventario`

### GET - Inventario de materiales de una sucursal
```http
GET /api/inventario/sucursal/{sucursalId}/materiales
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "materialId": 1,
      "materialNombre": "Harina de Trigo",
      "tipoUnidad": "KILOGRAMOS",
      "cantidad": 50.5,
      "stockMinimo": 10.0,
      "stockMaximo": 100.0,
      "precioUnitario": 2.50,
      "fechaUltimaActualizacion": "2026-04-08T10:30:00",
      "stockBajo": false
    }
  ],
  "message": "Inventario de materiales obtenido"
}
```

### GET - Inventario de productos elaborados
```http
GET /api/inventario/sucursal/{sucursalId}/productos
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productoElaboradoId": 1,
      "productoNombre": "Masa de Banderilla",
      "unidadMedida": "porciones",
      "cantidad": 20,
      "stockMinimo": 5,
      "fechaUltimaProduccion": "2026-04-08T09:00:00",
      "stockBajo": false
    }
  ],
  "message": "Inventario de productos obtenido"
}
```

### GET - Alertas de stock bajo
```http
GET /api/inventario/sucursal/{sucursalId}/stock-bajo
```
**Uso:** Muestra materiales que requieren reposición

### POST - Agregar/Actualizar stock
```http
POST /api/inventario/sucursal/{sucursalId}/agregar
Content-Type: application/json

{
  "materialId": 1,
  "cantidad": 25.0,
  "operacion": "AGREGAR",
  "precioUnitario": 2.50
}
```
**Operaciones:**
- `AGREGAR`: Suma la cantidad al stock actual
- `AJUSTAR`: Establece la cantidad exacta (ajuste de inventario)

### PUT - Actualizar stock mínimo
```http
PUT /api/inventario/item/{itemId}/stock-minimo
Content-Type: application/json

15.0
```

---

## RecetaController

**Base URL:** `/api/recetas`

### GET - Recetas de una sucursal
```http
GET /api/recetas/sucursal/{sucursalId}
```

### GET - Recetas activas de una sucursal
```http
GET /api/recetas/sucursal/{sucursalId}/activas
```

### GET - Obtener receta por ID
```http
GET /api/recetas/{id}
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Masa de Banderilla",
    "descripcion": "Masa para elaborar banderillas",
    "tiempoPreparacion": 30,
    "porciones": 10,
    "precioVenta": null,
    "tipoReceta": "INTERMEDIA",
    "activa": true,
    "sucursalId": 1,
    "sucursalNombre": "Sucursal Centro",
    "fechaCreacion": "2026-04-08T08:00:00",
    "ingredientes": [
      {
        "id": 1,
        "tipoIngrediente": "MATERIAL",
        "materialId": 1,
        "materialNombre": "Harina de Trigo",
        "cantidadRequerida": "2.0",
        "unidad": "KILOGRAMOS",
        "notas": "Tamizada"
      }
    ],
    "productoElaboradoNombre": "Masa de Banderilla"
  }
}
```

### POST - Crear nueva receta
```http
POST /api/recetas
Content-Type: application/json

{
  "nombre": "Masa de Banderilla",
  "descripcion": "Masa para elaborar banderillas",
  "tiempoPreparacion": 30,
  "porciones": 10,
  "tipoReceta": "INTERMEDIA",
  "activa": true,
  "sucursalId": 1
}
```
**Tipos de Receta:**
- `INTERMEDIA`: Se almacena como producto elaborado (puede usarse en otras recetas)
- `FINAL`: Producto terminado para venta (no se almacena)

### POST - Agregar ingrediente a receta
```http
POST /api/recetas/{recetaId}/ingredientes
Content-Type: application/json

{
  "tipoIngrediente": "MATERIAL",
  "materialId": 1,
  "cantidadRequerida": "2.0",
  "notas": "Tamizada"
}
```
**Para ingrediente de tipo Material:**
```json
{
  "tipoIngrediente": "MATERIAL",
  "materialId": 1,
  "cantidadRequerida": "2.0"
}
```

**Para ingrediente de tipo ProductoElaborado:**
```json
{
  "tipoIngrediente": "PRODUCTO_ELABORADO",
  "productoElaboradoId": 1,
  "cantidadRequerida": "10",
  "notas": "Debe estar a temperatura ambiente"
}
```

### DELETE - Eliminar ingrediente
```http
DELETE /api/recetas/ingredientes/{ingredienteId}
```

### PUT - Activar/Desactivar receta
```http
PUT /api/recetas/{id}/activar?activa=true
```

---

## ProduccionRecetaController

**Base URL:** `/api/produccion`

### POST - Elaborar receta (⭐ Endpoint principal)
```http
POST /api/produccion/elaborar
Content-Type: application/json
Authorization: Bearer {token}

{
  "recetaId": 2,
  "sucursalId": 1,
  "cantidad": 5,
  "observaciones": "Producción de la mañana"
}
```
**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "recetaId": 2,
    "recetaNombre": "Banderillas",
    "tipoReceta": "FINAL",
    "sucursalId": 1,
    "sucursalNombre": "Sucursal Centro",
    "usuarioId": 1,
    "usuarioEmail": "chef@example.com",
    "cantidad": 5,
    "fechaProduccion": "2026-04-08T11:30:00",
    "observaciones": "Producción de la mañana"
  },
  "message": "Receta elaborada exitosamente. Inventario actualizado."
}
```

**Respuesta con error (inventario insuficiente):**
```json
{
  "success": false,
  "data": null,
  "message": "Inventario insuficiente de Masa de Banderilla. Necesario: 10, Disponible: 5"
}
```

**¿Qué hace este endpoint?**
1. ✅ Verifica que hay suficiente inventario de TODOS los ingredientes
2. ✅ Reduce automáticamente materiales del inventario
3. ✅ Reduce automáticamente productos elaborados del inventario
4. ✅ Si es receta INTERMEDIA, agrega el producto al inventario
5. ✅ Registra la producción para trazabilidad

### GET - Verificar inventario disponible
```http
GET /api/produccion/verificar-inventario?recetaId=2&sucursalId=1&cantidad=5
```
**Respuesta:**
```json
{
  "success": true,
  "data": true,
  "message": "Inventario suficiente para producir"
}
```
**Uso:** Llamar ANTES de elaborar para validar que hay stock

### GET - Historial de producciones por sucursal
```http
GET /api/produccion/sucursal/{sucursalId}
```

### GET - Historial de producciones por receta
```http
GET /api/produccion/receta/{recetaId}
```
**Uso:** Ver cuántas veces se ha elaborado una receta específica

### GET - Producciones por usuario
```http
GET /api/produccion/usuario/{usuarioId}
```
**Uso:** Reportes de desempeño por empleado

### GET - Producciones por rango de fechas
```http
GET /api/produccion/fecha?inicio=2026-04-01T00:00:00&fin=2026-04-30T23:59:59
```
**Uso:** Reportes diarios, semanales o mensuales

### GET - Detalle de producción por ID
```http
GET /api/produccion/{id}
```

---

## 🔄 Flujo Completo: Elaborar Banderillas

### Paso 1: Crear materiales básicos
```http
POST /api/materiales
{"nombre": "Harina", "tipoMaterial": "INGREDIENTE", "tipoUnidad": "KILOGRAMOS", "activo": true}

POST /api/materiales
{"nombre": "Salchicha", "tipoMaterial": "INGREDIENTE", "tipoUnidad": "UNIDADES", "activo": true}
```

### Paso 2: Agregar al inventario
```http
POST /api/inventario/sucursal/1/agregar
{"materialId": 1, "cantidad": 100, "operacion": "AGREGAR", "precioUnitario": 2.50}

POST /api/inventario/sucursal/1/agregar
{"materialId": 2, "cantidad": 200, "operacion": "AGREGAR", "precioUnitario": 0.50}
```

### Paso 3: Crear receta INTERMEDIA (Masa)
```http
POST /api/recetas
{
  "nombre": "Masa de Banderilla",
  "tipoReceta": "INTERMEDIA",
  "porciones": 10,
  "sucursalId": 1
}
```

### Paso 4: Agregar ingredientes a la masa
```http
POST /api/recetas/1/ingredientes
{"tipoIngrediente": "MATERIAL", "materialId": 1, "cantidadRequerida": "2.0"}
```

### Paso 5: Elaborar la masa
```http
POST /api/produccion/elaborar
{"recetaId": 1, "sucursalId": 1, "cantidad": 10}
```
✅ Ahora hay 10 porciones de masa en el inventario de productos

### Paso 6: Crear receta FINAL (Banderillas)
```http
POST /api/recetas
{
  "nombre": "Banderillas",
  "tipoReceta": "FINAL",
  "porciones": 10,
  "precioVenta": 5.00,
  "sucursalId": 1
}
```

### Paso 7: Agregar ingredientes (usa la masa)
```http
POST /api/recetas/2/ingredientes
{"tipoIngrediente": "PRODUCTO_ELABORADO", "productoElaboradoId": 1, "cantidadRequerida": "10"}

POST /api/recetas/2/ingredientes
{"tipoIngrediente": "MATERIAL", "materialId": 2, "cantidadRequerida": "10"}
```

### Paso 8: Verificar inventario
```http
GET /api/produccion/verificar-inventario?recetaId=2&sucursalId=1&cantidad=10
```

### Paso 9: Elaborar las banderillas
```http
POST /api/produccion/elaborar
{"recetaId": 2, "sucursalId": 1, "cantidad": 10}
```
✅ Se consumen 10 porciones de masa + 10 salchichas
✅ Se registra la producción

---

## 📊 Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 OK | Operación exitosa |
| 201 CREATED | Recurso creado exitosamente |
| 400 BAD REQUEST | Error en los datos enviados o inventario insuficiente |
| 404 NOT FOUND | Recurso no encontrado |
| 500 INTERNAL SERVER ERROR | Error del servidor |

---

## 🔐 Autenticación

Los endpoints de **ProduccionRecetaController** requieren JWT:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Los demás endpoints pueden configurarse según necesidades de seguridad.

# API Testing Guide

Este directorio contiene archivos JSON con ejemplos de peticiones para probar todos los endpoints del sistema POS.

## Archivos Disponibles

1. **material-api.json** - Gestión de materiales e ingredientes
2. **receta-api.json** - Gestión de recetas y costos
3. **categoria-api.json** - Gestión de categorías de productos
4. **producto-api.json** - Gestión de productos del menú
5. **extras-api.json** - Gestión de extras (grupos, opciones y relaciones)
6. **orden-api.json** - Gestión de órdenes y detalles

## Base URL

Por defecto, todos los endpoints usan:
```
http://localhost:8080/api
```

## Cómo Usar

### Opción 1: Usar con herramientas REST Client

#### Con Postman:
1. Importar el archivo JSON correspondiente
2. Reemplazar los parámetros entre llaves `{id}` con valores reales
3. Ejecutar las peticiones en orden

#### Con VS Code REST Client:
Crear un archivo `.http` o `.rest` con el siguiente formato:

```http
### Crear Material
POST http://localhost:8080/api/materiales
Content-Type: application/json

{
  "nombre": "Harina de Trigo",
  "codigo": "MAT001",
  "unidadMedida": "Kilogramo",
  "costoUnitario": 25.50,
  "stockMinimo": 10.0,
  "stockActual": 50.0,
  "usuario": { "id": 1 }
}

### Obtener Material por ID
GET http://localhost:8080/api/materiales/1

### Buscar Materiales
GET http://localhost:8080/api/materiales/buscar?termino=harina&idUsuario=1
```

### Opción 2: Usar con cURL

#### Ejemplo: Crear Material
```bash
curl -X POST http://localhost:8080/api/materiales \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Harina de Trigo",
    "codigo": "MAT001",
    "unidadMedida": "Kilogramo",
    "costoUnitario": 25.50,
    "stockMinimo": 10.0,
    "stockActual": 50.0,
    "usuario": { "id": 1 }
  }'
```

#### Ejemplo: Obtener Material por ID
```bash
curl -X GET http://localhost:8080/api/materiales/1
```

#### Ejemplo: Buscar Materiales
```bash
curl -X GET "http://localhost:8080/api/materiales/buscar?termino=harina&idUsuario=1"
```

## Flujos Recomendados para Pruebas

### 1. Setup Inicial
```
1. Crear Usuario (si no existe)
2. Crear Sucursal
3. Crear Categorías
4. Crear Materiales
5. Crear Recetas
```

### 2. Configurar Menú
```
1. Crear Productos
2. Crear Grupos de Extras
3. Crear Opciones de Extras
4. Asociar Extras a Productos (ProductoGrupoExtra)
```

### 3. Flujo de Orden Completo
```
1. Crear Orden
2. Agregar Detalles (productos)
3. Agregar Extras a Detalles
4. Aplicar Descuento (opcional)
5. Recalcular Totales
6. Cambiar Estado a EN_PREPARACION
7. Cerrar Orden (LISTA)
8. Completar Orden (ENTREGADA)
```

## Notas Importantes

### Enums del Sistema

**EstadoOrden:**
- PENDIENTE
- EN_PREPARACION
- LISTA
- ENTREGADA
- CANCELADA

**TipoOrden:**
- COMER_AQUI
- PARA_LLEVAR
- DOMICILIO

### IDs de Referencia

Los ejemplos usan IDs genéricos. Antes de ejecutar las peticiones:
1. Reemplaza `{id}` con IDs reales de tu base de datos
2. Verifica que las entidades referenciadas existan
3. Los IDs de usuario, sucursal, etc. deben existir previamente

### Validaciones Comunes

- Los campos `usuario`, `sucursal`, `producto`, etc. requieren objetos con `id` válido
- Los precios y costos deben ser números positivos
- Las cantidades deben ser mayores a 0
- Los códigos y SKUs deben ser únicos

## Estructura de Respuesta

Todas las respuestas siguen el formato `ApiResponseWrapper`:

```json
{
  "success": true,
  "data": { /* objeto o array */ },
  "message": "Mensaje descriptivo"
}
```

### Respuesta Exitosa (200/201)
```json
{
  "success": true,
  "data": { "id": 1, "nombre": "..." },
  "message": "Material creado exitosamente"
}
```

### Respuesta de Error (400/404)
```json
{
  "success": false,
  "data": null,
  "message": "Material no encontrado con ID: 1"
}
```

## Testing Automatizado

Para testing automatizado, considera usar:
- JUnit + RestAssured (Java)
- Pytest + Requests (Python)
- Jest + Axios (JavaScript)
- Colecciones de Postman con Newman

## Soporte

Si encuentras problemas con algún endpoint:
1. Verifica que el servidor esté ejecutándose
2. Revisa los logs de la aplicación
3. Confirma que las entidades referenciadas existan
4. Verifica los datos de entrada contra los DTOs

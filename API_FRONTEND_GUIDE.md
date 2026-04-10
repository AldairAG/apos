# Guía de API para Frontend - React Native con TypeScript, Redux y Axios

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#1-configuración-inicial)
2. [Tipos TypeScript](#2-tipos-typescript)
3. [API de Autenticación](#3-api-de-autenticación)
4. [API de Sucursales](#4-api-de-sucursales)
5. [API de Inventario](#5-api-de-inventario)
6. [API de Recetas](#6-api-de-recetas)
7. [Manejo de Errores](#7-manejo-de-errores)
8. [Redux Integration](#8-redux-integration)

---

## 1. Configuración Inicial

### Base URL
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
// En producción, usar variable de entorno
// const API_BASE_URL = process.env.REACT_APP_API_URL;
```

### Configuración de Axios

```typescript
// src/config/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken(); // Función para obtener token de AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas
api.interceptors.response.use(
  (response) => response.data, // Retorna directamente los datos
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      // navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. Tipos TypeScript

### Tipos Base

```typescript
// src/types/api.types.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export enum Rol {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE = 'GERENTE',
  MESERO = 'MESERO',
  COCINA = 'COCINA',
}

export enum TipoMaterial {
  INGREDIENTE = 'INGREDIENTE',
  EMPAQUE = 'EMPAQUE',
  INSUMO = 'INSUMO',
}

export enum TipoUnidad {
  KILOGRAMOS = 'KILOGRAMOS',
  GRAMOS = 'GRAMOS',
  LITROS = 'LITROS',
  MILILITROS = 'MILILITROS',
  UNIDADES = 'UNIDADES',
}

export enum TipoReceta {
  INTERMEDIA = 'INTERMEDIA',
  FINAL = 'FINAL',
}

export enum TipoIngrediente {
  MATERIAL = 'MATERIAL',
  PRODUCTO_ELABORADO = 'PRODUCTO_ELABORADO',
}
```

### Tipos de Entidades

```typescript
// src/types/entities.types.ts

export interface Usuario {
  id: number;
  email: string;
  activo: boolean;
  rol: Rol;
  sucursales?: Sucursal[];
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  propietario: string;
  activa: boolean;
}

export interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  tipoMaterial: TipoMaterial;
  tipoUnidad: TipoUnidad;
  precioPorPaquete: number;
  cantidadPorPaquete: number;
  activo: boolean;
}

export interface InventarioItem {
  id: number;
  material: Material;
  cantidad: number;
  stockMinimo: number;
  stockMaximo: number;
  precioUnitario: number;
  fechaUltimaActualizacion: string;
  fechaUltimaCompra: string | null;
}

export interface ProductoElaborado {
  id: number;
  nombre: string;
  descripcion: string;
  recetaOrigen?: Receta;
  unidadMedida: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface InventarioProducto {
  id: number;
  productoElaborado: ProductoElaborado;
  cantidad: number;
  stockMinimo: number;
  fechaUltimaActualizacion: string;
  fechaUltimaProduccion: string;
}

export interface Inventario {
  id: number;
  sucursal?: Sucursal;
  items: InventarioItem[];
  productosElaborados: InventarioProducto[];
}

export interface RecetaIngrediente {
  id: number;
  material?: Material;
  productoElaborado?: ProductoElaborado;
  tipoIngrediente: TipoIngrediente;
  cantidadRequerida: number;
  notas: string;
}

export interface Receta {
  id: number;
  nombre: string;
  descripcion: string;
  tiempoPreparacion: number;
  porciones: number;
  precioVenta: number | null;
  activa: boolean;
  sucursal: Sucursal;
  ingredientes: RecetaIngrediente[];
  productoElaborado?: ProductoElaborado;
  tipoReceta: TipoReceta;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface ProduccionReceta {
  id: number;
  receta: Receta;
  sucursal: Sucursal;
  usuario: Usuario;
  cantidad: number;
  fechaProduccion: string;
  observaciones: string;
}
```

### Tipos de Request

```typescript
// src/types/requests.types.ts

export interface AuthRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  jwt: string;
  usuario: Usuario;
}

export interface CrearSucursalRequest {
  nombre: string;
  direccion: string;
  telefono: string;
  propietario: string;
}

export interface AgregarItemRequest {
  materialId?: number; // Si es material existente
  nombre?: string; // Si es nuevo material
  descripcion?: string;
  tipoMaterial?: TipoMaterial;
  tipoUnidad?: TipoUnidad;
  precioPorPaquete?: number;
  cantidadPorPaquete?: number;
  cantidad: number;
  stockMinimo: number;
  stockMaximo: number;
  precioUnitario: number;
}

export interface RecetaIngredienteRequest {
  materialId?: number;
  productoElaboradoId?: number;
  tipoIngrediente: TipoIngrediente;
  cantidadRequerida: number;
  notas: string;
}

export interface CrearRecetaRequest {
  nombre: string;
  descripcion: string;
  tiempoPreparacion: number;
  porciones: number;
  precioVenta?: number;
  tipoReceta: TipoReceta;
  ingredientes: RecetaIngredienteRequest[];
}
```

---

## 3. API de Autenticación

### 3.1 Registro de Usuario

**Endpoint**: `POST /usuarios/registro`

```typescript
// src/services/auth.service.ts
import api from '../config/axios';
import { ApiResponse, AuthRequest, JwtResponse } from '../types';

export const registrarUsuario = async (
  email: string,
  password: string
): Promise<ApiResponse<JwtResponse>> => {
  const response = await api.post<ApiResponse<JwtResponse>>(
    '/usuarios/registro',
    { email, password }
  );
  return response;
};
```

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "email": "usuario@example.com",
      "activo": true,
      "rol": "ADMINISTRADOR",
      "sucursales": []
    }
  },
  "message": null
}
```

**Uso en componente**:
```typescript
import { registrarUsuario } from '../services/auth.service';

const handleRegistro = async () => {
  try {
    const response = await registrarUsuario(email, password);
    if (response.success && response.data) {
      // Guardar token
      await AsyncStorage.setItem('token', response.data.jwt);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.usuario));
      // Navegar a home
      navigation.navigate('Home');
    }
  } catch (error) {
    Alert.alert('Error', error.response?.data?.message || 'Error al registrar');
  }
};
```

---

### 3.2 Inicio de Sesión

**Endpoint**: `POST /usuarios/login`

```typescript
export const login = async (
  email: string,
  password: string
): Promise<ApiResponse<JwtResponse>> => {
  const response = await api.post<ApiResponse<JwtResponse>>(
    '/usuarios/login',
    { email, password }
  );
  return response;
};
```

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "email": "usuario@example.com",
      "activo": true,
      "rol": "ADMINISTRADOR",
      "sucursales": [
        {
          "id": 1,
          "nombre": "Sucursal Centro",
          "direccion": "Av. Principal 123",
          "telefono": "555-1234",
          "propietario": "Juan Pérez",
          "activa": true
        }
      ]
    }
  },
  "message": null
}
```

---

## 4. API de Sucursales

### 4.1 Obtener Sucursales del Usuario

**Endpoint**: `GET /usuarios/{usuarioId}/sucursales`

```typescript
// src/services/sucursal.service.ts
import api from '../config/axios';
import { ApiResponse, Sucursal } from '../types';

export const obtenerSucursales = async (
  usuarioId: number
): Promise<ApiResponse<Sucursal[]>> => {
  const response = await api.get<ApiResponse<Sucursal[]>>(
    `/usuarios/${usuarioId}/sucursales`
  );
  return response;
};
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Sucursal Centro",
      "direccion": "Av. Principal 123",
      "telefono": "555-1234",
      "propietario": "Juan Pérez",
      "activa": true
    },
    {
      "id": 2,
      "nombre": "Sucursal Norte",
      "direccion": "Calle Secundaria 456",
      "telefono": "555-5678",
      "propietario": "Juan Pérez",
      "activa": true
    }
  ],
  "message": null
}
```

---

### 4.2 Crear Sucursal

**Endpoint**: `POST /usuarios/{usuarioId}/sucursales`

```typescript
export const crearSucursal = async (
  usuarioId: number,
  datos: CrearSucursalRequest
): Promise<ApiResponse<CrearSucursalRequest>> => {
  const response = await api.post<ApiResponse<CrearSucursalRequest>>(
    `/usuarios/${usuarioId}/sucursales`,
    datos
  );
  return response;
};
```

**Request**:
```json
{
  "nombre": "Sucursal Sur",
  "direccion": "Av. Sur 789",
  "telefono": "555-9999",
  "propietario": "Juan Pérez"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nombre": "Sucursal Sur",
    "direccion": "Av. Sur 789",
    "telefono": "555-9999",
    "propietario": "Juan Pérez"
  },
  "message": null
}
```

---

### 4.3 Eliminar Sucursal

**Endpoint**: `DELETE /usuarios/{usuarioId}/sucursales/{sucursalId}`

```typescript
export const eliminarSucursal = async (
  usuarioId: number,
  sucursalId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(
    `/usuarios/${usuarioId}/sucursales/${sucursalId}`
  );
  return response;
};
```

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": null
}
```

---

## 5. API de Inventario

### 5.1 Obtener Inventario de Sucursal

**Endpoint**: `GET /inventario/sucursal/{sucursalId}`

```typescript
// src/services/inventario.service.ts
import api from '../config/axios';
import { ApiResponse, Inventario } from '../types';

export const obtenerInventario = async (
  sucursalId: number
): Promise<ApiResponse<Inventario>> => {
  const response = await api.get<ApiResponse<Inventario>>(
    `/inventario/sucursal/${sucursalId}`
  );
  return response;
};
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 10,
        "material": {
          "id": 5,
          "nombre": "Harina de Trigo",
          "descripcion": "Harina refinada",
          "tipoMaterial": "INGREDIENTE",
          "tipoUnidad": "KILOGRAMOS",
          "precioPorPaquete": 25.50,
          "cantidadPorPaquete": 10.0,
          "activo": true
        },
        "cantidad": 50.0,
        "stockMinimo": 10.0,
        "stockMaximo": 100.0,
        "precioUnitario": 2.55,
        "fechaUltimaActualizacion": "2026-04-09T15:30:00",
        "fechaUltimaCompra": null
      }
    ],
    "productosElaborados": [
      {
        "id": 5,
        "productoElaborado": {
          "id": 3,
          "nombre": "Masa de Banderilla",
          "descripcion": "Masa lista para freír",
          "unidadMedida": "porciones",
          "activo": true,
          "fechaCreacion": "2026-04-08T10:00:00"
        },
        "cantidad": 10.0,
        "stockMinimo": 5.0,
        "fechaUltimaActualizacion": "2026-04-09T16:00:00",
        "fechaUltimaProduccion": "2026-04-09T15:30:00"
      }
    ]
  },
  "message": null
}
```

---

### 5.2 Agregar Item al Inventario (Material Nuevo)

**Endpoint**: `POST /inventario/{inventarioId}/items`

```typescript
export const agregarItemInventario = async (
  inventarioId: number,
  item: AgregarItemRequest
): Promise<ApiResponse<InventarioItem>> => {
  const response = await api.post<ApiResponse<InventarioItem>>(
    `/inventario/${inventarioId}/items`,
    item
  );
  return response;
};
```

**Request - Material Nuevo**:
```json
{
  "nombre": "Harina de Trigo",
  "descripcion": "Harina refinada para panadería",
  "tipoMaterial": "INGREDIENTE",
  "tipoUnidad": "KILOGRAMOS",
  "precioPorPaquete": 25.50,
  "cantidadPorPaquete": 10.0,
  "cantidad": 50.0,
  "stockMinimo": 10.0,
  "stockMaximo": 100.0,
  "precioUnitario": 2.55
}
```

**Request - Material Existente**:
```json
{
  "materialId": 5,
  "cantidad": 30.0,
  "stockMinimo": 5.0,
  "stockMaximo": 50.0,
  "precioUnitario": 2.00
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 15,
    "material": {
      "id": 5,
      "nombre": "Harina de Trigo",
      "tipoMaterial": "INGREDIENTE",
      "tipoUnidad": "KILOGRAMOS"
    },
    "cantidad": 50.0,
    "stockMinimo": 10.0,
    "stockMaximo": 100.0,
    "precioUnitario": 2.55,
    "fechaUltimaActualizacion": "2026-04-10T10:00:00"
  },
  "message": null
}
```

---

### 5.3 Actualizar Item del Inventario

**Endpoint**: `PUT /inventario/items/{itemId}`

```typescript
export const actualizarItemInventario = async (
  itemId: number,
  item: AgregarItemRequest
): Promise<ApiResponse<InventarioItem>> => {
  const response = await api.put<ApiResponse<InventarioItem>>(
    `/inventario/items/${itemId}`,
    item
  );
  return response;
};
```

**Request**:
```json
{
  "materialId": 5,
  "cantidad": 75.0,
  "stockMinimo": 10.0,
  "stockMaximo": 100.0,
  "precioUnitario": 2.30
}
```

---

### 5.4 Eliminar Item del Inventario

**Endpoint**: `DELETE /inventario/items/{itemId}`

```typescript
export const eliminarItemInventario = async (
  itemId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(
    `/inventario/items/${itemId}`
  );
  return response;
};
```

---

### 5.5 Obtener Items de un Inventario

**Endpoint**: `GET /inventario/{inventarioId}/items`

```typescript
export const obtenerItems = async (
  inventarioId: number
): Promise<ApiResponse<InventarioItem[]>> => {
  const response = await api.get<ApiResponse<InventarioItem[]>>(
    `/inventario/${inventarioId}/items`
  );
  return response;
};
```

---

### 5.6 Obtener Items con Stock Bajo

**Endpoint**: `GET /inventario/{inventarioId}/items/stock-bajo`

```typescript
export const obtenerItemsStockBajo = async (
  inventarioId: number
): Promise<ApiResponse<InventarioItem[]>> => {
  const response = await api.get<ApiResponse<InventarioItem[]>>(
    `/inventario/${inventarioId}/items/stock-bajo`
  );
  return response;
};
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "material": {
        "nombre": "Azúcar"
      },
      "cantidad": 3.0,
      "stockMinimo": 10.0,
      "stockMaximo": 50.0
    }
  ],
  "message": null
}
```

---

## 6. API de Recetas

### 6.1 Obtener Recetas de Sucursal

**Endpoint**: `GET /recetas/sucursal/{sucursalId}`

```typescript
// src/services/receta.service.ts
import api from '../config/axios';
import { ApiResponse, Receta } from '../types';

export const obtenerRecetas = async (
  sucursalId: number
): Promise<ApiResponse<Receta[]>> => {
  const response = await api.get<ApiResponse<Receta[]>>(
    `/recetas/sucursal/${sucursalId}`
  );
  return response;
};
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "nombre": "Masa de Banderilla",
      "descripcion": "Masa preparada para banderillas",
      "tiempoPreparacion": 30,
      "porciones": 10,
      "precioVenta": null,
      "activa": true,
      "tipoReceta": "INTERMEDIA",
      "ingredientes": [
        {
          "id": 25,
          "material": {
            "id": 5,
            "nombre": "Harina de Trigo"
          },
          "tipoIngrediente": "MATERIAL",
          "cantidadRequerida": 2.0,
          "notas": "Harina refinada"
        }
      ],
      "fechaCreacion": "2026-04-08T10:00:00"
    }
  ],
  "message": null
}
```

---

### 6.2 Obtener Recetas Activas

**Endpoint**: `GET /recetas/sucursal/{sucursalId}/activas`

```typescript
export const obtenerRecetasActivas = async (
  sucursalId: number
): Promise<ApiResponse<Receta[]>> => {
  const response = await api.get<ApiResponse<Receta[]>>(
    `/recetas/sucursal/${sucursalId}/activas`
  );
  return response;
};
```

---

### 6.3 Obtener Receta por ID

**Endpoint**: `GET /recetas/{recetaId}`

```typescript
export const obtenerRecetaPorId = async (
  recetaId: number
): Promise<ApiResponse<Receta>> => {
  const response = await api.get<ApiResponse<Receta>>(
    `/recetas/${recetaId}`
  );
  return response;
};
```

---

### 6.4 Crear Receta

**Endpoint**: `POST /recetas/sucursal/{sucursalId}`

```typescript
export const crearReceta = async (
  sucursalId: number,
  receta: CrearRecetaRequest
): Promise<ApiResponse<Receta>> => {
  const response = await api.post<ApiResponse<Receta>>(
    `/recetas/sucursal/${sucursalId}`,
    receta
  );
  return response;
};
```

**Request - Receta INTERMEDIA**:
```json
{
  "nombre": "Masa de Banderilla",
  "descripcion": "Masa preparada para elaborar banderillas",
  "tiempoPreparacion": 30,
  "porciones": 10,
  "tipoReceta": "INTERMEDIA",
  "ingredientes": [
    {
      "materialId": 5,
      "tipoIngrediente": "MATERIAL",
      "cantidadRequerida": 2.0,
      "notas": "Harina de trigo"
    },
    {
      "materialId": 8,
      "tipoIngrediente": "MATERIAL",
      "cantidadRequerida": 1.0,
      "notas": "Agua filtrada"
    }
  ]
}
```

**Request - Receta FINAL**:
```json
{
  "nombre": "Banderillas",
  "descripcion": "Banderillas fritas listas para vender",
  "tiempoPreparacion": 15,
  "porciones": 10,
  "precioVenta": 50.00,
  "tipoReceta": "FINAL",
  "ingredientes": [
    {
      "productoElaboradoId": 3,
      "tipoIngrediente": "PRODUCTO_ELABORADO",
      "cantidadRequerida": 10.0,
      "notas": "Masa de Banderilla"
    },
    {
      "materialId": 20,
      "tipoIngrediente": "MATERIAL",
      "cantidadRequerida": 10.0,
      "notas": "Salchichas"
    }
  ]
}
```

---

### 6.5 Actualizar Receta

**Endpoint**: `PUT /recetas/{recetaId}`

```typescript
export const actualizarReceta = async (
  recetaId: number,
  receta: CrearRecetaRequest
): Promise<ApiResponse<Receta>> => {
  const response = await api.put<ApiResponse<Receta>>(
    `/recetas/${recetaId}`,
    receta
  );
  return response;
};
```

---

### 6.6 Eliminar Receta

**Endpoint**: `DELETE /recetas/{recetaId}`

```typescript
export const eliminarReceta = async (
  recetaId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(
    `/recetas/${recetaId}`
  );
  return response;
};
```

---

### 6.7 Activar/Desactivar Receta

**Endpoint**: `PATCH /recetas/{recetaId}/estado?activa={boolean}`

```typescript
export const cambiarEstadoReceta = async (
  recetaId: number,
  activa: boolean
): Promise<ApiResponse<Receta>> => {
  const response = await api.patch<ApiResponse<Receta>>(
    `/recetas/${recetaId}/estado`,
    null,
    { params: { activa } }
  );
  return response;
};
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "nombre": "Masa de Banderilla",
    "activa": false
  },
  "message": "Receta desactivada exitosamente"
}
```

---

## 7. Manejo de Errores

### Tipos de Errores

```typescript
// src/types/error.types.ts
export interface ApiError {
  success: false;
  data: null;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
```

### Interceptor de Errores

```typescript
// src/config/axios.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Error desconocido';
    
    switch (error.response?.status) {
      case 400:
        // Bad Request - Validación
        console.error('Validación:', errorMessage);
        break;
      case 401:
        // No autorizado - Token inválido
        console.error('No autorizado');
        // Limpiar token y redirigir a login
        AsyncStorage.removeItem('token');
        break;
      case 404:
        // No encontrado
        console.error('Recurso no encontrado');
        break;
      case 500:
        // Error del servidor
        console.error('Error del servidor');
        break;
    }
    
    return Promise.reject(error);
  }
);
```

### Manejo en Componentes

```typescript
const handleCrearReceta = async () => {
  try {
    setLoading(true);
    const response = await crearReceta(sucursalId, recetaData);
    
    if (response.success) {
      Alert.alert('Éxito', 'Receta creada correctamente');
      navigation.goBack();
    }
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al crear receta';
    Alert.alert('Error', message);
  } finally {
    setLoading(false);
  }
};
```

---

## 8. Redux Integration

### Store Configuration

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sucursalReducer from './slices/sucursalSlice';
import inventarioReducer from './slices/inventarioSlice';
import recetaReducer from './slices/recetaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sucursal: sucursalReducer,
    inventario: inventarioReducer,
    receta: recetaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice

```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login, registrarUsuario } from '../../services/auth.service';
import { Usuario, JwtResponse } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await login(email, password);
    if (response.success && response.data) {
      await AsyncStorage.setItem('token', response.data.jwt);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.usuario));
      return response.data;
    }
    throw new Error(response.message || 'Error al iniciar sesión');
  }
);

export const registroThunk = createAsyncThunk(
  'auth/registro',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await registrarUsuario(email, password);
    if (response.success && response.data) {
      await AsyncStorage.setItem('token', response.data.jwt);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.usuario));
      return response.data;
    }
    throw new Error(response.message || 'Error al registrar');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    setUser: (state, action: PayloadAction<Usuario>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.usuario;
        state.token = action.payload.jwt;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error';
      })
      .addCase(registroThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registroThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.usuario;
        state.token = action.payload.jwt;
      })
      .addCase(registroThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error';
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
```

### Inventario Slice

```typescript
// src/store/slices/inventarioSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { obtenerInventario, agregarItemInventario } from '../../services/inventario.service';
import { Inventario, InventarioItem, AgregarItemRequest } from '../../types';

interface InventarioState {
  inventario: Inventario | null;
  loading: boolean;
  error: string | null;
}

const initialState: InventarioState = {
  inventario: null,
  loading: false,
  error: null,
};

export const fetchInventario = createAsyncThunk(
  'inventario/fetch',
  async (sucursalId: number) => {
    const response = await obtenerInventario(sucursalId);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener inventario');
  }
);

export const agregarItem = createAsyncThunk(
  'inventario/agregarItem',
  async ({ inventarioId, item }: { inventarioId: number; item: AgregarItemRequest }) => {
    const response = await agregarItemInventario(inventarioId, item);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Error al agregar item');
  }
);

const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {
    clearInventario: (state) => {
      state.inventario = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventario.fulfilled, (state, action) => {
        state.loading = false;
        state.inventario = action.payload;
      })
      .addCase(fetchInventario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error';
      })
      .addCase(agregarItem.fulfilled, (state, action) => {
        if (state.inventario) {
          state.inventario.items.push(action.payload);
        }
      });
  },
});

export const { clearInventario } = inventarioSlice.actions;
export default inventarioSlice.reducer;
```

### Uso en Componentes

```typescript
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Iniciar Sesión" onPress={handleLogin} />
      )}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};
```

---

## 📚 Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **Autenticación** |
| POST | `/usuarios/registro` | Registro de usuario |
| POST | `/usuarios/login` | Inicio de sesión |
| **Sucursales** |
| GET | `/usuarios/{id}/sucursales` | Obtener sucursales del usuario |
| POST | `/usuarios/{id}/sucursales` | Crear sucursal |
| DELETE | `/usuarios/{id}/sucursales/{sucId}` | Eliminar sucursal |
| **Inventario** |
| GET | `/inventario/sucursal/{id}` | Obtener inventario completo |
| POST | `/inventario/{id}/items` | Agregar item |
| PUT | `/inventario/items/{id}` | Actualizar item |
| DELETE | `/inventario/items/{id}` | Eliminar item |
| GET | `/inventario/{id}/items` | Listar items |
| GET | `/inventario/{id}/items/stock-bajo` | Items con stock bajo |
| **Recetas** |
| GET | `/recetas/sucursal/{id}` | Listar recetas |
| GET | `/recetas/sucursal/{id}/activas` | Recetas activas |
| GET | `/recetas/{id}` | Obtener receta |
| POST | `/recetas/sucursal/{id}` | Crear receta |
| PUT | `/recetas/{id}` | Actualizar receta |
| DELETE | `/recetas/{id}` | Eliminar receta |
| PATCH | `/recetas/{id}/estado?activa={bool}` | Cambiar estado |

---

**Versión**: 1.0  
**Última actualización**: Abril 2026  
**Autor**: Equipo Backend APOS

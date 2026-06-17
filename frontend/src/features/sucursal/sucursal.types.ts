export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  codigo: string;
  telefono: string;
  email: string;
  horarioApertura: string;
  horarioCierre: string;
  timezone: string;
  activa: boolean;
  latitud?: number;
  longitud?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SucursalState {
  sucursalActual: Sucursal | null;
  sucursales: Sucursal[];
  loading: boolean;
  error: string | null;
}

export interface CreateSucursalDTO {
  nombre: string;
  direccion: string;
  codigo: string;
  telefono: string;
  email: string;
  horarioApertura: string;
  horarioCierre: string;
  timezone: string;
  activa: boolean;
  latitud?: number;
  longitud?: number;
}

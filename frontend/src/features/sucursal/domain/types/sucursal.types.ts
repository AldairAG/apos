export interface SucursalDto {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    estado: "ACTIVA" | "INACTIVA";
}

export const API_BASE_PATH = "/sucursales";

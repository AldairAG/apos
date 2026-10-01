// Debe reflejar exactamente com.api.apos.enums.EstadoMesa del backend.
export type EstadoMesa = "LIBRE" | "OCUPADA" | "RESERVADA";

export interface MesaDto {
    id?: number;
    numero?: number;
    nombre: string;
    estado?: EstadoMesa;
    sucursalId: number;
}

export const MESA_API_BASE_PATH = "/mesas";

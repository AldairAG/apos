import { OrdenDto } from "@/features/pos/domain/types/pos.types";

// Debe reflejar exactamente com.api.apos.enums.EstadoMesa del backend.
export type EstadoMesa = "LIBRE" | "OCUPADA" | "RESERVADA";

export interface MesaDto {
    id?: number;
    numero?: number;
    nombre: string;
    estado?: EstadoMesa;
    sucursalId: number;
    ordenActual?: OrdenDto;
    
}

export const MESA_API_BASE_PATH = "/mesas";

import { MaterialDto, UnidadMedida } from "@/features/material/domain/types/material.types";

export type TipoResultadoReceta = "PRODUCTO" | "MATERIAL";

export interface RecetaDetalleDto {
    id?: number;
    cantidad: number;
    unidadMedida: UnidadMedida;
    costo: number;
    nombreMaterial?: string;
    materialId: number;
}

export interface RecetaDto {
    id?: number;
    nombre: string;
    rendimiento: number;
    notas?: string;
    tiempoPreparacion?: number;
    porcentajeSobreCostos?: number;
    costoTotal: number;
    instrucciones: string[];
    recetaDetalles: RecetaDetalleDto[];
    tipoResultado?: TipoResultadoReceta;
    materialResultado?: MaterialDto;
}

export const API_BASE_PATH = "/recetas";

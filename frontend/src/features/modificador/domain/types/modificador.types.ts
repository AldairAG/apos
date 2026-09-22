import type { ApiResponse } from "@/api/apiTypes";

export interface OpcionDto {
    id?: number;
    nombre: string;
    precio: number;
    costo: number;
    maximo: number;
}

export interface ModificadorDto {
    id?: number;
    nombre: string;
    opciones: OpcionDto[];
}

export type ObtenerModificadoresResponse = ApiResponse<ModificadorDto[]>;
export type CrearModificadorResponse = ApiResponse<ModificadorDto>;

export const API_BASE_PATH = "/modificadores";
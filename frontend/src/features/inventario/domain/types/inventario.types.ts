import type { UnidadMedida } from "@/features/material/domain/types/material.types";

export type TipoOperacionInventario = "entrada" | "salida" | "merma" | "consumo-personal";
export type TipoMovimientoInventario = "ENTRADA" | "SALIDA";
export type ConceptoMovimientoInventario =
    | "COMPRA"
    | "VENTA"
    | "AJUSTE"
    | "MERMA"
    | "CONSUMO_PERSONAL"
    | "PRODUCCION";

export interface ExistenciaDto {
    id: number;
    cantidadActual: number;
    cantidadMinima: number;
    estado: "STOCK_COMPLETO" | "STOCK_BAJO" | "SIN_STOCK";
    unidadMedida: UnidadMedida;
    material: {
        id?: number;
        nombre: string;
        unidad: UnidadMedida;
    };
    materialId: number;
    sucursalId: number;
}

export interface MovimientoInventarioDto {
    id: number;
    materialId: number;
    materialNombre: string;
    sucursalId: number;
    sucursalNombre: string;
    cantidad: number;
    tipoMovimiento: TipoMovimientoInventario;
    conceptoMovimiento: ConceptoMovimientoInventario;
    usuarioId: number;
    usuarioNombre: string;
    fecha: string;
}

export interface RegistrarMovimientoInventarioDto {
    materialId: number;
    sucursalId: number;
    cantidad: number;
}

export interface ProducirMaterialDto {
    recetaId: number;
    sucursalId: number;
    cantidad: number;
}

export interface InventarioPage<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface InventarioPageParams {
    sucursalId: number;
    page?: number;
    size?: number;
}

export const API_BASE_PATH = "/inventario";
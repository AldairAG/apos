import type { CategoriaDto } from "@/features/categoria/domain/types/categoria.types";
import type { ModificadorDto } from "@/features/modificador/domain/types/modificador.types";
import type { RecetaDetalleDto } from "@/features/receta/domain/types/receta.types";

export interface ProductoDto {
    id?: number;
    nombre: string;
    precio: number;
    costo: number;
    margenGanancia?: number;
    disponible: boolean;
    recetaDetalles: RecetaDetalleDto[];
    modificadores?: ModificadorDto[];
    categoria?: CategoriaDto;
    categoriaId: number;
    modificadorIds: number[];
    sucursalId: number;
    porcentajeSobreCostos?: number;
}

// El backend asigna un producto a una sola sucursal por petición; para varias se envía una por sucursal.
export interface CrearProductoPayload {
    producto: Omit<ProductoDto, "sucursalId">;
    sucursalIds: number[];
}

export const API_BASE_PATH = "/productos";
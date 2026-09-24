import type { CategoriaDto } from "@/features/categoria/domain/types/categoria.types";
import type { ModificadorDto } from "@/features/modificador/domain/types/modificador.types";
import type { RecetaDto } from "@/features/receta/domain/types/receta.types";

export interface ProductoDto {
    id?: number;
    nombre: string;
    precio: number;
    costo: number;
    margenGanancia?: number;
    disponible: boolean;
    receta?: RecetaDto;
    modificadores?: ModificadorDto[];
    categoria?: CategoriaDto;
    categoriaId: number;
    recetaId?: number;
    modificadorIds: number[];
    sucursalId: number;
}

export const API_BASE_PATH = "/productos";
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface CreateCategoriaDTO {
  nombre: string;
}

export interface UpdateCategoriaDTO {
  id: number;
  nombre?: string;
  activo?: boolean;
}

export interface CategoriaState {
  categorias: Categoria[];
  selectedCategoria: Categoria | null;
  loading: boolean;
  error: string | null;
}

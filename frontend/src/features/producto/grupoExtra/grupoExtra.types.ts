export interface GrupoExtra {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  opciones: OpcionExtra[];
}

export interface OpcionExtra {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  grupoExtraId: number;
  materialId: number;
}

export interface CreateGrupoExtraDTO {
  nombre: string;
  descripcion: string;
}

export interface UpdateGrupoExtraDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreateOpcionExtraDTO {
  nombre: string;
  precio: number;
  grupoExtraId: number;
  materialId: number;
}

export interface UpdateOpcionExtraDTO {
  nombre?: string;
  precio?: number;
  activo?: boolean;
  materialId?: number;
}

export interface GrupoExtraState {
  grupos: GrupoExtra[];
  selectedGrupo: GrupoExtra | null;
  loading: boolean;
  error: string | null;
}

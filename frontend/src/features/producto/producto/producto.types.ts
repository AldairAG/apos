export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precioVenta: number;
    costo: number;
    margen: number;
    tiempoPreparacion: number;
    activo: boolean;
    disponible: boolean;
    destacado: boolean;
    categoria: Categoria;
    gruposExtra: ProductoGrupoExtra[];
} 

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

export interface ProductoGrupoExtra {
    id: number;
    minimo: number;
    maximo: number;
    obligatorio: boolean;
    createdAt: string;
    updatedAt: string;
    productoId: number;
    grupoExtraId: number;
}

export interface ProductoState {
    productos: Producto[];
    selectedProducto: Producto | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
}
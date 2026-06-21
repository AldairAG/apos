import { apiBase } from '@/api/apiBase';
import { Producto } from './producto.types';

const PRODUCTO_BASE_URL = '/productos';

export interface CreateProductoDTO {
  nombre: string;
  descripcion: string;
  precioVenta: number;
  costo: number;
  tiempoPreparacion: number;
  destacado: boolean;
  categoriaId: number;
  recetaId: number;
  gruposExtraIds?: number[];
}

export interface UpdateProductoDTO {
  nombre?: string;
  descripcion?: string;
  precioVenta?: number;
  costo?: number;
  tiempoPreparacion?: number;
  activo?: boolean;
  disponible?: boolean;
  destacado?: boolean;
  categoriaId?: number;
  gruposExtraIds?: number[];
}

export const productoService = {
  /**
   * Obtiene todos los productos de una sucursal
   */
  getBySucursal: async (sucursalId: number): Promise<Producto[]> => {
    const response = await apiBase.get<Producto[]>(`${PRODUCTO_BASE_URL}/sucursal/${sucursalId}`);
    return response.data;
  },

  /**
   * Obtiene un producto por ID
   */
  getById: async (id: number): Promise<Producto> => {
    const response = await apiBase.get<Producto>(`${PRODUCTO_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Busca productos por nombre
   */
  search: async (sucursalId: number, query: string): Promise<Producto[]> => {
    const response = await apiBase.get<Producto[]>(`${PRODUCTO_BASE_URL}/sucursal/${sucursalId}/buscar`, {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Crea un nuevo producto desde una receta
   */
  create: async (data: CreateProductoDTO): Promise<Producto> => {
    const response = await apiBase.post<Producto>(PRODUCTO_BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza un producto
   */
  update: async (id: number, data: UpdateProductoDTO): Promise<Producto> => {
    const response = await apiBase.put<Producto>(`${PRODUCTO_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un producto
   */
  delete: async (id: number): Promise<void> => {
    await apiBase.delete(`${PRODUCTO_BASE_URL}/${id}`);
  },

  /**
   * Cambia el estado de disponibilidad de un producto
   */
  toggleDisponibilidad: async (id: number): Promise<Producto> => {
    const response = await apiBase.patch<Producto>(`${PRODUCTO_BASE_URL}/${id}/disponibilidad`);
    return response.data;
  },

  /**
   * Asocia grupos extra a un producto
   */
  associateGruposExtra: async (productoId: number, gruposExtraIds: number[]): Promise<Producto> => {
    const response = await apiBase.post<Producto>(
      `${PRODUCTO_BASE_URL}/${productoId}/grupos-extra`,
      { gruposExtraIds }
    );
    return response.data;
  },
};

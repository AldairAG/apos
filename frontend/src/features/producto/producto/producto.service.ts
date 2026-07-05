import { apiBase } from '@/api/apiBase';
import { createProductoDTO, Producto } from './producto.types';

const PRODUCTO_BASE_URL = '/productos';

const unwrapResponseData = <T>(response: any): T => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data && response.data.data !== undefined) {
    return response.data.data as T;
  }

  return response?.data as T;
};

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
    const response = await apiBase.get<any>(`${PRODUCTO_BASE_URL}/sucursal/${sucursalId}`);
    return unwrapResponseData<Producto[]>(response) ?? [];
  },

  /**
   * Obtiene un producto por ID
   */
  getById: async (id: number): Promise<Producto> => {
    const response = await apiBase.get<any>(`${PRODUCTO_BASE_URL}/${id}`);
    return unwrapResponseData<Producto>(response);
  },

  /**
   * Crea un nuevo producto desde una receta
   */
  create: async (data: createProductoDTO): Promise<Producto> => {
    const response = await apiBase.post<any>(PRODUCTO_BASE_URL, data);
    return unwrapResponseData<Producto>(response);
  },

  /**
   * Actualiza un producto
   */
  update: async (id: number, data: UpdateProductoDTO): Promise<Producto> => {
    const response = await apiBase.put<any>(`${PRODUCTO_BASE_URL}/${id}`, data);
    return unwrapResponseData<Producto>(response);
  },

  /**
   * Elimina un producto
   */
  delete: async (id: number): Promise<void> => {
    await apiBase.delete(`${PRODUCTO_BASE_URL}/${id}`);
  },

};

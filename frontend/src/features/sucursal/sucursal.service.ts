import { apiBase } from '@/api/apiBase';
import { CreateSucursalDTO, Sucursal } from './sucursal.types';

const SUCURSAL_BASE_URL = '/sucursales';

export const sucursalService = {
  /**
   * Obtiene todas las sucursales
   */
  getAll: async (id: number): Promise<Sucursal[]> => {
    const response = await apiBase.get<Sucursal[]>(`${SUCURSAL_BASE_URL}/usuario/${id}`);
    return response.data;
  },

  /**
   * Obtiene una sucursal por ID
   */
  getById: async (id: number): Promise<Sucursal> => {
    const response = await apiBase.get<Sucursal>(`${SUCURSAL_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva sucursal
   */
  create: async (data: CreateSucursalDTO): Promise<Sucursal> => {
    const response = await apiBase.post<Sucursal>(SUCURSAL_BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza una sucursal
   */
  update: async (id: number, data: Partial<CreateSucursalDTO>): Promise<Sucursal> => {
    const response = await apiBase.put<Sucursal>(`${SUCURSAL_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una sucursal
   */
  delete: async (id: number): Promise<void> => {
    await apiBase.delete(`${SUCURSAL_BASE_URL}/${id}`);
  },
};

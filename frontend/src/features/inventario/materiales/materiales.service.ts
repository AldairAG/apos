import { apiBase } from '@/api/apiBase';
import { CreateMaterialDTO, Material, UpdateMaterialDTO } from './materiales.types';

const MATERIAL_BASE_URL = '/materiales';

export const materialesService = {
  /**
   * Obtiene todos los materiales
   */
  getAll: async (): Promise<Material[]> => {
    const response = await apiBase.get<any>(`${MATERIAL_BASE_URL}/usuario`);
    return response.data?.data ?? response.data ?? [];
  },

  /**
   * Obtiene todos los materiales de una sucursal
   */
  getBySucursal: async (sucursalId: number): Promise<Material[]> => {
    const response = await apiBase.get<any>(`${MATERIAL_BASE_URL}/sucursal/${sucursalId}`);
    return response.data?.data ?? response.data ?? [];
  },

  /**
   * Obtiene un material por ID
   */
  getById: async (id: number): Promise<Material> => {
    const response = await apiBase.get<any>(`${MATERIAL_BASE_URL}/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Crea un nuevo material
   */
  create: async (data: CreateMaterialDTO): Promise<Material> => {
    const response = await apiBase.post<any>(MATERIAL_BASE_URL, data);
    return response.data?.data ?? response.data;
  },

  /**
   * Actualiza un material
   */
  update: async (id: number, data: UpdateMaterialDTO): Promise<Material> => {
    const response = await apiBase.put<any>(`${MATERIAL_BASE_URL}/${id}`, data);
    return response.data?.data ?? response.data;
  },

  /**
   * Elimina un material
   */
  delete: async (id: number): Promise<void> => {
    await apiBase.delete(`${MATERIAL_BASE_URL}/${id}`);
  },
};
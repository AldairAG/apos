import { apiBase } from '@/api/apiBase';
import {
    CreateGrupoExtraDTO,
    CreateOpcionExtraDTO,
    GrupoExtra,
    OpcionExtra,
    UpdateGrupoExtraDTO,
    UpdateOpcionExtraDTO
} from './grupoExtra.types';

const GRUPO_EXTRA_BASE_URL = '/grupos-extra';
const OPCION_EXTRA_BASE_URL = '/opciones-extra';

export const grupoExtraService = {
  // ========== Grupos Extra ==========
  /**
   * Obtiene todos los grupos extra
   */
  getAll: async (): Promise<GrupoExtra[]> => {
    const response = await apiBase.get<GrupoExtra[]>(GRUPO_EXTRA_BASE_URL);
    return response.data;
  },

  /**
   * Obtiene un grupo extra por ID
   */
  getById: async (id: number): Promise<GrupoExtra> => {
    const response = await apiBase.get<GrupoExtra>(`${GRUPO_EXTRA_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo grupo extra
   */
  create: async (data: CreateGrupoExtraDTO): Promise<GrupoExtra> => {
    const response = await apiBase.post<GrupoExtra>(GRUPO_EXTRA_BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza un grupo extra
   */
  update: async (id: number, data: UpdateGrupoExtraDTO): Promise<GrupoExtra> => {
    const response = await apiBase.put<GrupoExtra>(`${GRUPO_EXTRA_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un grupo extra
   */
  delete: async (id: number): Promise<void> => {
    await apiBase.delete(`${GRUPO_EXTRA_BASE_URL}/${id}`);
  },

  // ========== Opciones Extra ==========
  /**
   * Obtiene todas las opciones de un grupo extra
   */
  getOpcionesByGrupo: async (grupoId: number): Promise<OpcionExtra[]> => {
    const response = await apiBase.get<OpcionExtra[]>(`${GRUPO_EXTRA_BASE_URL}/${grupoId}/opciones`);
    return response.data;
  },

  /**
   * Crea una nueva opción extra
   */
  createOpcion: async (data: CreateOpcionExtraDTO): Promise<OpcionExtra> => {
    const response = await apiBase.post<OpcionExtra>(OPCION_EXTRA_BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza una opción extra
   */
  updateOpcion: async (id: number, data: UpdateOpcionExtraDTO): Promise<OpcionExtra> => {
    const response = await apiBase.put<OpcionExtra>(`${OPCION_EXTRA_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una opción extra
   */
  deleteOpcion: async (id: number): Promise<void> => {
    await apiBase.delete(`${OPCION_EXTRA_BASE_URL}/${id}`);
  },
};

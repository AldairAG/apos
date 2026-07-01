import { apiBase } from '@/api/apiBase';
import { CrearRecetaDTO, Receta } from './receta.types';

const RECETA_BASE_URL = '/recetas';

export const recetaService = {

    /**
       * Obtiene todas las recetas
       */
    getAll: async (): Promise<Receta[]> => {
        const response = await apiBase.get<any>(`${RECETA_BASE_URL}/usuario`);
        return response.data?.data ?? response.data ?? [];
    },

    /**
     * Obtiene todas las recetas de una sucursal
     */
    getBySucursal: async (sucursalId: number): Promise<Receta[]> => {
        const response = await apiBase.get<any>(`${RECETA_BASE_URL}/sucursal/${sucursalId}`);
        return response.data?.data ?? response.data ?? [];
    },

    /**
     * Obtiene una receta por ID
     */
    getById: async (id: number): Promise<Receta> => {
        const response = await apiBase.get<any>(`${RECETA_BASE_URL}/${id}`);
        return response.data?.data ?? response.data;
    },

    /**
     * Crea una nueva receta
     */
    create: async (data: CrearRecetaDTO): Promise<Receta> => {
        const response = await apiBase.post<any>(RECETA_BASE_URL, data);
        return response.data?.data ?? response.data;
    },

    /**
     * Actualiza una receta
     */
    update: async (id: number, data: Receta): Promise<Receta> => {
        const response = await apiBase.put<any>(`${RECETA_BASE_URL}/${id}`, data);
        return response.data?.data ?? response.data;
    },

    /**
     * Elimina una receta
     */
    delete: async (id: number): Promise<void> => {
        await apiBase.delete<any>(`${RECETA_BASE_URL}/${id}`);
    },

}
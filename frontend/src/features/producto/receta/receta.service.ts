import { apiBase } from '@/api/apiBase';
import { Receta } from './receta.types';
import { CreateMaterialDTO, Material } from '@/features/inventario/materiales/materiales.types';


const RECETA_BASE_URL = '/recetas';

export const recetaService = {

    /**
       * Obtiene todas las recetas
       */
    getAll: async (): Promise<Receta[]> => {
        const response = await apiBase.get<Receta[]>(RECETA_BASE_URL);
        return response.data;
    },

    /**
     * Obtiene todas las recetas de una sucursal
     */
    getBySucursal: async (sucursalId: number): Promise<Receta[]> => {
        const response = await apiBase.get<Receta[]>(`${RECETA_BASE_URL}/sucursal/${sucursalId}`);
        return response.data;
    },

    /**
     * Obtiene una receta por ID
     */
    getById: async (id: number): Promise<Receta> => {
        const response = await apiBase.get<Receta>(`${RECETA_BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Crea una nueva receta
     */
    create: async (data: Receta): Promise<Receta> => {
        const response = await apiBase.post<Receta>(RECETA_BASE_URL, data);
        return response.data;
    },

    /**
     * Actualiza una receta
     */
    update: async (id: number, data: Receta): Promise<Receta> => {
        const response = await apiBase.put<Receta>(`${RECETA_BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Elimina una receta
     */
    delete: async (id: number): Promise<void> => {
        await apiBase.delete(`${RECETA_BASE_URL}/${id}`);
    },

}
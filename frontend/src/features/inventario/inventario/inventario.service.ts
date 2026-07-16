import { apiBase } from '@/api/apiBase';
import { MaterialDTO } from './inventario.types';

const INVENTARIO_BASE_URL = '/inventario';

export const inventarioService = {

    getBySucursalId: async (sucursalId: number): Promise<MaterialDTO[]> => {
        const response = await apiBase.get<any>(`${INVENTARIO_BASE_URL}/getBySucursalId/${sucursalId}`);
        return response.data?.data ?? response.data ?? [];
    },

    ajustarExistencia: async (materialId: number, cantidad: number): Promise<MaterialDTO> => {
        const response = await apiBase.post<any>(`${INVENTARIO_BASE_URL}/ajustar`, {
            materialId,
            cantidad
        });
        return response.data?.data ?? response.data;
    },

    hacerProduccion: async (materialId: number, cantidad: number): Promise<MaterialDTO> => {
        const response = await apiBase.post<any>(`${INVENTARIO_BASE_URL}/producir`, {
            materialId,
            cantidad
        });
        return response.data?.data ?? response.data;
    }

};
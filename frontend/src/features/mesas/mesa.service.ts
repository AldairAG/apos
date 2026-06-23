import { apiBase } from '@/api/apiBase';
import { CrearMesaDTO, Mesa, MesaResponse } from './mesas.types';

const MESA_BASE_URL = '/mesas';

export const mesaService = {

    /**
     * Obtiene las mesas por ID de sucursal
     */
    getBySucursalId: async (sucursalId: number): Promise<Mesa[]> => {
        const response = await apiBase.get<Mesa[]>(`${MESA_BASE_URL}/sucursal/${sucursalId}`);
        return response.data;
    }
}

import { apiBase } from '@/api/apiBase';
import { CrearOrdenDTO, OrdenResponseDTO, ProductosBySucursalResponse } from './pos.types';

const POS_BASE_URL = '/pos';

export const posService = {

    /**
     * Crea una nueva orden
     */
    createOrden: async (data: CrearOrdenDTO): Promise<OrdenResponseDTO> => {
        const response = await apiBase.post<OrdenResponseDTO>(POS_BASE_URL, data);
        return response.data;
    },

    /**
     * Obtiene todas las ordenes de una sucursal
     */
    getBySucursal: async (sucursalId: number): Promise<OrdenResponseDTO[]> => {
        const response = await apiBase.get<OrdenResponseDTO[]>(`${POS_BASE_URL}/orden/sucursal/${sucursalId}`);
        return response.data;
    },

    /**
     * Obtiene todos los productos de una sucursal
     */
    getProductosBySucursal: async (sucursalId: number): Promise<ProductosBySucursalResponse[]> => {
        const response = await apiBase.get<ProductosBySucursalResponse[]>(`${POS_BASE_URL}/productos/sucursal/${sucursalId}`);
        return response.data;
    }

}
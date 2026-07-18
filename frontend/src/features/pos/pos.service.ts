import { apiBase } from '@/api/apiBase';
import { CrearOrdenDTO, EstadoOrden, MesaPosResponseDTO, OrdenResponseDTO, ProductosBySucursalResponse } from './pos.types';

const POS_BASE_URL = '/pos';
const ORDENES_BASE_URL = '/ordenes';

const unwrapResponseData = <T>(response: any): T => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data && response.data.data !== undefined) {
    return response.data.data as T;
  }

  return response?.data as T;
};

export const posService = {

    /**
     * Crea una nueva orden
     */
    createOrden: async (data: CrearOrdenDTO): Promise<OrdenResponseDTO> => {
        const response = await apiBase.post<any>(`${POS_BASE_URL}/crear-orden`, data);
        return unwrapResponseData<OrdenResponseDTO>(response);
    },

    /**
     * Obtiene todas las ordenes de una sucursal
     */
    getBySucursal: async (sucursalId: number): Promise<OrdenResponseDTO[]> => {
        const response = await apiBase.get<any>(`${POS_BASE_URL}/orden/sucursal/${sucursalId}`);
        return unwrapResponseData<OrdenResponseDTO[]>(response) ?? [];
    },

    /**
     * Cancela una orden
     */
    cancelOrden: async (ordenId: number, motivo: string): Promise<void> => {
        await apiBase.patch<void>(`/ordenes/${ordenId}/cancelar?motivo=${encodeURIComponent(motivo)}`);
    },

    /**
     * Obtiene todos los productos de una sucursal
     */
    getProductosBySucursal: async (sucursalId: number): Promise<ProductosBySucursalResponse[]> => {
        const response = await apiBase.get<any>(`${POS_BASE_URL}/productos/sucursal/${sucursalId}`);
        return unwrapResponseData<ProductosBySucursalResponse[]>(response) ?? [];
    },

    /**
     * Obtiene todas las mesas de una sucursal
     */
    getMesasBySucursal: async (sucursalId: number): Promise<MesaPosResponseDTO[]> => {
        const response = await apiBase.get<any>(`${POS_BASE_URL}/mesas/sucursal/${sucursalId}`);
        return unwrapResponseData<MesaPosResponseDTO[]>(response) ?? [];
    },

    updateOrdenEstado: async (ordenId: number, estado: EstadoOrden): Promise<OrdenResponseDTO> => {
        const response = await apiBase.put<any>(`${ORDENES_BASE_URL}/${ordenId}/estado?estado=${estado}`);
        return unwrapResponseData<OrdenResponseDTO>(response);
    },

    cancelarOrden: async (ordenId: number, motivo?: string): Promise<void> => {
        const url = motivo
            ? `${ORDENES_BASE_URL}/${ordenId}/cancelar?motivo=${encodeURIComponent(motivo)}`
            : `${ORDENES_BASE_URL}/${ordenId}/cancelar`;

        await apiBase.patch<any>(url);
    }

}
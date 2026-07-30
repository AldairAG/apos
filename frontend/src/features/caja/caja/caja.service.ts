import { apiBase } from '@/api/apiBase';
import { Caja, CrearCajaRequest, MovimientoCaja } from './caja.types';
const CAJA_BASE_URL = '/caja';

const unwrapResponseData = <T>(response: any): T => {
    if (response?.data && typeof response.data === 'object' && 'data' in response.data && response.data.data !== undefined) {
        return response.data.data as T;
    }

    return response?.data as T;
};

export const cajaService = {

    /**
     * Crea una nueva orden
     */
    createCaja: async (data: CrearCajaRequest): Promise<Caja> => {
        const response = await apiBase.post<any>(`${CAJA_BASE_URL}`, data);
        return unwrapResponseData<Caja>(response);
    },

    /**
     * Obtener todas las cajas de una sucursal
     */
    getCajasBySucursal: async (sucursalId: number): Promise<Caja[]> => {
        const response = await apiBase.get<any>(`${CAJA_BASE_URL}/getBySucursal/${sucursalId}`);
        return unwrapResponseData<Caja[]>(response);
    },

    /**
     * Metodo para obtener los movimientos de una caja relacionados al corte actual
     * @param cajaId
     * @return ResponseEntity con la lista de movimientos de caja
     */
    getMovimientosByCaja: async (cajaId: number): Promise<Caja> => {
        const response = await apiBase.get<any>(`${CAJA_BASE_URL}/getMovimientosByCaja/${cajaId}`);
        return unwrapResponseData<Caja>(response);
    },

    /**
     * Metodo para abrir una caja
     * @param cajaId
     * @return ResponseEntity con la caja abierta
     */
    abrirCaja: async (cajaId: number): Promise<Caja> => {
        const response = await apiBase.post<any>(`${CAJA_BASE_URL}/abrirCaja`, null, { params: { cajaId } });
        return unwrapResponseData<Caja>(response);
    },

    /**
     * Metodo para cerrar una caja
     * @param cajaId
     * @return ResponseEntity con la caja cerrada
     */
    cerrarCaja: async (cajaId: number): Promise<Caja> => {
        const response = await apiBase.post<any>(`${CAJA_BASE_URL}/cerrarCaja`, null, { params: { cajaId } });
        return unwrapResponseData<Caja>(response);
    },

    /**
     * Metodo para hacer un corte de caja
     * @param cajaId
     * @return ResponseEntity con la caja con el corte realizado
     */
    hacerCorteCaja: async (cajaId: number): Promise<Caja> => {
        const response = await apiBase.post<any>(`${CAJA_BASE_URL}/hacerCorteCaja`, null, { params: { cajaId } });
        return unwrapResponseData<Caja>(response);
    },

    /**
     * Metodo para registrar un gasto en una caja
     * @param cajaId
     * @param gasto
     * @return ResponseEntity con la caja con el gasto registrado
     */
    registrarGasto: async (movimiento:MovimientoCaja): Promise<MovimientoCaja> => {
        const response = await apiBase.post<any>(`${CAJA_BASE_URL}/registrarGasto`, movimiento);
        return unwrapResponseData<MovimientoCaja>(response);
    },

    /**
     * Metodo para registrar un ingreso en una caja
     * @param cajaId
     * @param ingreso
     * @return ResponseEntity con la caja con el ingreso registrado
     */
    registrarIngreso: async (movimiento:MovimientoCaja): Promise<MovimientoCaja> => {
        const response = await apiBase.post<any>(`${CAJA_BASE_URL}/registrarIngreso`, movimiento);  
        return unwrapResponseData<MovimientoCaja>(response);
    },

    /**
     * Metodo para obtener los movimientos del corte actual de una caja
     * @param cajaId
     * @return ResponseEntity con la lista de movimientos de caja
     */
    getMovimientosDelCorteActual: async (cajaId: number): Promise<MovimientoCaja[]> => {
        const response = await apiBase.get<any>(`${CAJA_BASE_URL}/getMovimientosByCorteActual/${cajaId}`);
        return unwrapResponseData<MovimientoCaja[]>(response);
    }

}

import {api, ApiResponseWrapper } from "@/api/apiBase";
import { Sucursal } from "./sucursales.types";

const BASE_PATH = '/sucursales';

export const sucursalesService = {
    getSucursales: async (): Promise<Sucursal[]> => {
        try {
            const response = await api.get<ApiResponseWrapper<Sucursal[]>>(BASE_PATH);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'No fue posible obtener las sucursales');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener sucursales:', error);
            throw new Error('No fue posible obtener las sucursales');
        }
    },

    crearSucursal: async (sucursal: Omit<Sucursal, 'id'>): Promise<Sucursal> => {
        try {
            const response = await api.post<ApiResponseWrapper<Sucursal>>(BASE_PATH, sucursal);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'No fue posible crear la sucursal');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error al crear sucursal:', error);
            throw new Error('No fue posible crear la sucursal');
        }
    }

}
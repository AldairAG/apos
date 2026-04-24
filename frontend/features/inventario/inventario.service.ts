import {api, ApiResponseWrapper, JwtResponse } from "@/api/apiBase";
import { AgregarItemRequest } from "./inventario.types";

const BASE_PATH = '/inventario';

export const inventarioService = {
    agregarItem: async (request: AgregarItemRequest): Promise<JwtResponse> => {
        try {
            const response = await api.post<ApiResponseWrapper<JwtResponse>>(
                `${BASE_PATH}/items`,
                request
            );

            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'No fue posible agregar el item');
            }

            return response.data.data;
        } catch (error) {
            console.log(error);
            throw error;
        } 
    }
};    

export default inventarioService;
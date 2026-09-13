import { createAsyncThunk } from "@reduxjs/toolkit";
import { SucursalDto } from "../../domain/types/sucursal.types";
import { ApiResponse } from "@/api/apiTypes";
import { api } from "@/api/apiBase";

export const findSucursalesByEmpresaThunk = createAsyncThunk<
    ApiResponse<SucursalDto[]>,
    void,
    { rejectValue: string }
>(
    'sucursal/findSucursalesByEmpresa',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<SucursalDto[]>(`/sucursales`);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener las sucursales';
            return rejectWithValue(errorMessage);
        }
    }
);

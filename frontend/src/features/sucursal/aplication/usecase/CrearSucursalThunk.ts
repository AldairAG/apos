import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SucursalDto } from "../../domain/types/sucursal.types";

export const crearSucursalThunk = createAsyncThunk<
    ApiResponse<SucursalDto>,
    SucursalDto,
    { rejectValue: string }
>(
    'sucursal/crearSucursal',
    async (SucursalDto, { rejectWithValue }) => {
        try {
            const response = await api.post<SucursalDto>(`/sucursales`, SucursalDto);
            if (!response.success) {
                return rejectWithValue(response.message);
            }
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear la sucursal';
            return rejectWithValue(errorMessage);
        }
    }
);

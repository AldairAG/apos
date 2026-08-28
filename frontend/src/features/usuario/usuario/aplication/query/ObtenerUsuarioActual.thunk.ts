import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, UsuarioDto } from "../../domain/types/usuario.types";
import { api, apiBase } from "@/api/apiBase";


export const obtenerUsuarioActual = createAsyncThunk<
    UsuarioDto,
    void,
    { rejectValue: string }>(
        "usuario/obtenerUsuarioActual",
        async (_, thunkAPI) => {
            try {
                const response = await api.get<UsuarioDto>(`${API_BASE_PATH}`);
                if (!response.success) {
                    throw new Error(response.message);
                }
                return response.data;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Error al obtener el usuario actual';
                return thunkAPI.rejectWithValue(errorMessage);
            }
        }
    );
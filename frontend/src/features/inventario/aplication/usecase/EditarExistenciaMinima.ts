import { ApiResponse } from "@/api/apiTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, ExistenciaDto } from "../../domain/types/inventario.types";
import { api } from "@/api/apiBase";


export const editarExistenciaMinimaThunk = createAsyncThunk<
    ApiResponse<ExistenciaDto>,
    ExistenciaDto,
    { rejectValue: string }
>("inventario/editarExistenciaMinima", async (request, { rejectWithValue }) => {
    try {
        const response = await api.patch<ExistenciaDto>(`${API_BASE_PATH}/existencia/ajustar-minima`, request);
        return response.success ? response : rejectWithValue(response.message);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Error al editar la existencia mínima");
    }
});
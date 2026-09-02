import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_PATH, EmpresaDto } from "../../domain/types/empresa.types";
import { api } from "@/api/apiBase";
import { ApiResponse } from "@/api/apiTypes";

export const  crearEmpresaThunk = createAsyncThunk<
    ApiResponse<EmpresaDto>,
    EmpresaDto,
    { rejectValue: string }>(
        "empresa/crear",
        async (empresa, { rejectWithValue }) => {
            try {
                const response = await api.post<EmpresaDto>(`${API_BASE_PATH}/`, empresa);
                if (!response.success) {
                    throw new Error(response.message);
                }
                return response;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Error al crear la empresa';
                return rejectWithValue(errorMessage);
            }
        }
    );
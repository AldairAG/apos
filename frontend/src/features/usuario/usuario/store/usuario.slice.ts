import { ApiResponse } from "@/api/apiTypes";
import { crearEmpresaThunk } from "@/features/empresa/aplication/usecase/crearEmpresa.thunk";
import { EmpresaDto } from "@/features/empresa/domain/types/empresa.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { obtenerUsuarioActual } from "../aplication/query/ObtenerUsuarioActual.thunk";
import { UsuarioDto } from "../domain/types/usuario.types";


interface UsuarioState {
    usuario: UsuarioDto | null;
    loading: boolean;
    error: string | null;
}

const initialState: UsuarioState = {
    usuario: null,
    loading: false,
    error: null,
};

const usuarioSlice = createSlice({
    name: 'usuario',
    initialState,
    reducers: {
        setUsuario(state, action: PayloadAction<UsuarioDto>) {
            state.usuario = action.payload;
            state.error = null;
        },
        clearUsuario(state) {
            state.usuario = null;
            state.error = null;
        },
        removerCuenta(state, action: PayloadAction<number>) {
            if (state.usuario?.empresa?.cuentas) {
                state.usuario.empresa.cuentas = state.usuario.empresa.cuentas.filter(
                    (cuenta) => cuenta.id !== action.payload
                );
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(obtenerUsuarioActual.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(obtenerUsuarioActual.fulfilled, (state, action: PayloadAction<UsuarioDto>) => {
                state.loading = false;
                state.usuario = action.payload;
                state.error = null;
            })
            .addCase(obtenerUsuarioActual.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Error al obtener el usuario actual';
            })
            .addCase(crearEmpresaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(crearEmpresaThunk.fulfilled, (state, action: PayloadAction<ApiResponse<EmpresaDto>>) => {
                if (state.usuario) {
                    state.usuario.empresa = action.payload.data;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(crearEmpresaThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Error al crear la empresa';
            });
    }
});

export const { setUsuario, clearUsuario, removerCuenta } = usuarioSlice.actions;
export default usuarioSlice.reducer;

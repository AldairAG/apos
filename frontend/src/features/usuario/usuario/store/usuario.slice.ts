import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UsuarioDto } from "../domain/types/usuario.types";
import { obtenerUsuarioActual } from "../aplication/query/ObtenerUsuarioActual.thunk";


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
        });
    }
});

export const { setUsuario, clearUsuario } = usuarioSlice.actions;
export default usuarioSlice.reducer;
    
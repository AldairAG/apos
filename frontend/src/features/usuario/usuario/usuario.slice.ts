import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Usuario } from "./usuario.types";


interface UsuarioState {
    usuario: Usuario | null;
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
        setUsuario(state, action: PayloadAction<Usuario>) {
            state.usuario = action.payload;
            state.error = null;
        },
        clearUsuario(state) {
            state.usuario = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Aquí puedes manejar acciones asíncronas relacionadas con el usuario
    }
});

export const { setUsuario, clearUsuario } = usuarioSlice.actions;
export default usuarioSlice.reducer;
    
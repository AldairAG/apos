import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findModificadoresByEmpresaThunk } from "../aplication/query/FindModificadoresByEmpresaThunk";
import { crearModificadorThunk } from "../aplication/usecase/CrearModificadorThunk";
import type { ModificadorDto } from "../domain/types/modificador.types";

interface ModificadorState {
    modificadores: ModificadorDto[];
    loading: boolean;
    error: string | null;
}

const initialState: ModificadorState = {
    modificadores: [],
    loading: false,
    error: null,
};

const modificadorSlice = createSlice({
    name: "modificador",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(findModificadoresByEmpresaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findModificadoresByEmpresaThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.modificadores = action.payload.data;
        });
        builder.addCase(
            findModificadoresByEmpresaThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al obtener los modificadores";
            }
        );
        builder.addCase(crearModificadorThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearModificadorThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.modificadores.push(action.payload.data);
        });
        builder.addCase(
            crearModificadorThunk.rejected,
            (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? "Error al crear el modificador";
            }
        );
    },
});

export default modificadorSlice.reducer;
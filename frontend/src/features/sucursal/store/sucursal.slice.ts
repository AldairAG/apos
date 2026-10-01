import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { findSucursalesByEmpresaThunk } from "../aplication/query/FindSucursalesByEmpresaThunk";
import { crearSucursalThunk } from "../aplication/usecase/CrearSucursalThunk";
import { desactivarSucursalThunk } from "../aplication/usecase/DesactivarSucursalThunk";
import { SucursalDto } from "../domain/types/sucursal.types";

interface SucursalState {
    sucursales: SucursalDto[];
    sucursalSeleccionadaId: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: SucursalState = {
    sucursales: [],
    sucursalSeleccionadaId: null,
    loading: false,
    error: null,
};

const sucursalSlice = createSlice({
    name: "sucursal",
    initialState,
    reducers: {
        seleccionarSucursal(state, action: PayloadAction<number>) {
            state.sucursalSeleccionadaId = action.payload;
        },
        limpiarSucursalSeleccionada(state) {
            state.sucursalSeleccionadaId = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(crearSucursalThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(crearSucursalThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.sucursales.push(action.payload.data);
        });
        builder.addCase(crearSucursalThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al crear la sucursal";
        });
        builder.addCase(findSucursalesByEmpresaThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(findSucursalesByEmpresaThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.sucursales = action.payload.data;
        });
        builder.addCase(findSucursalesByEmpresaThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al obtener las sucursales";
        });
        builder.addCase(desactivarSucursalThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(desactivarSucursalThunk.fulfilled, (state, action) => {
            state.loading = false;
            const deletedId = action.meta.arg;
            state.sucursales = state.sucursales.filter((sucursal) => sucursal.id !== deletedId);
            if (state.sucursalSeleccionadaId === deletedId) state.sucursalSeleccionadaId = null;
        });
        builder.addCase(desactivarSucursalThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
            state.loading = false;
            state.error = action.payload ?? "Error al desactivar la sucursal";
        });
    },
});

export const { seleccionarSucursal, limpiarSucursalSeleccionada } = sucursalSlice.actions;
export default sucursalSlice.reducer;

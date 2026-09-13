import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SucursalDto } from "../domain/types/sucursal.types";
import { crearSucursalThunk } from "../aplication/usecase/CrearSucursalThunk";
import { findSucursalesByEmpresaThunk } from "../aplication/query/FindSucursalesByEmpresaThunk";

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
    },
});

export const { seleccionarSucursal, limpiarSucursalSeleccionada } = sucursalSlice.actions;
export default sucursalSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SucursalDto } from "../domain/types/sucursal.types";

// TODO: sustituir por datos reales cuando exista el endpoint de sucursales en el backend.
const SUCURSALES_MOCK: SucursalDto[] = [
    { id: "15", nombre: "Sucursal Centro", direccion: "Av. Principal 123", telefono: "555-0101", estado: "ACTIVA" },
    { id: "18", nombre: "Sucursal Norte", direccion: "Blvd. Norte 456", telefono: "555-0102", estado: "ACTIVA" },
    { id: "22", nombre: "Sucursal Sur", direccion: "Calle Sur 789", telefono: "555-0103", estado: "INACTIVA" },
];

interface SucursalState {
    sucursales: SucursalDto[];
    sucursalSeleccionadaId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: SucursalState = {
    sucursales: SUCURSALES_MOCK,
    sucursalSeleccionadaId: null,
    loading: false,
    error: null,
};

const sucursalSlice = createSlice({
    name: "sucursal",
    initialState,
    reducers: {
        seleccionarSucursal(state, action: PayloadAction<string>) {
            state.sucursalSeleccionadaId = action.payload;
        },
        limpiarSucursalSeleccionada(state) {
            state.sucursalSeleccionadaId = null;
        },
    },
});

export const { seleccionarSucursal, limpiarSucursalSeleccionada } = sucursalSlice.actions;
export default sucursalSlice.reducer;

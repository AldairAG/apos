import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Caja, CajaState, MovimientoCaja, Corte } from "./caja.types";

const initialState: CajaState = {
    cajas: [],
    cajaSeleccionada: null,
    MovimientosCaja: [],
    corteActual: null,
    loading: false,
    error: null,
};

const cajaSlice = createSlice({
    name: "caja",
    initialState,
    reducers: {
        setCajaSeleccionada: (state, action: PayloadAction<Caja | null>) => {
            state.cajaSeleccionada = action.payload;
        },
        setMovimientosCaja: (state, action: PayloadAction<MovimientoCaja[]>) => {
            state.MovimientosCaja = action.payload;
        },
        setCorteActual: (state, action: PayloadAction<Corte | null>) => {
            state.corteActual = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    }
})



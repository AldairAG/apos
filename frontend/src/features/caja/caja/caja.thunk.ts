import { createAsyncThunk } from "@reduxjs/toolkit";

import { cajaService } from "./caja.service";
import { Caja, CrearCajaRequest, MovimientoCaja } from "./caja.types";

export const crearCajaThunk = createAsyncThunk<
    Caja,
    CrearCajaRequest,
    { rejectValue: string }
>('caja/crear', async (data, { rejectWithValue }) => {
    try {
        const caja = await cajaService.createCaja(data);
        return caja;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al crear la caja'
        );
    }
});

export const fetchCajasBySucursalThunk = createAsyncThunk<
    Caja[],
    number,
    { rejectValue: string }
>('caja/fetchBySucursal', async (sucursalId, { rejectWithValue }) => {
    try {
        const cajas = await cajaService.getCajasBySucursal(sucursalId);
        return cajas;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar las cajas'
        );
    }
});

export const fetchMovimientosByCajaThunk = createAsyncThunk<
    Caja,
    number,
    { rejectValue: string }
>('caja/fetchMovimientosByCaja', async (cajaId, { rejectWithValue }) => {
    try {
        const caja = await cajaService.getMovimientosByCaja(cajaId);
        return caja;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar los movimientos de la caja'
        );
    }
});

export const abrirCajaThunk = createAsyncThunk<
    Caja,
    number,
    { rejectValue: string }
>('caja/abrirCaja', async (cajaId, { rejectWithValue }) => {
    try {
        const caja = await cajaService.abrirCaja(cajaId);
        return caja;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al abrir la caja'
        );
    }
});

export const cerrarCajaThunk = createAsyncThunk<
    Caja,
    number,
    { rejectValue: string }
>('caja/cerrarCaja', async (cajaId, { rejectWithValue }) => {
    try {
        const caja = await cajaService.cerrarCaja(cajaId);
        return caja;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cerrar la caja'
        );
    }
});

export const hacerCorteCajaThunk = createAsyncThunk<
    Caja,
    number,
    { rejectValue: string }
>('caja/hacerCorteCaja', async (cajaId, { rejectWithValue }) => {
    try {
        const caja = await cajaService.hacerCorteCaja(cajaId);
        return caja;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al hacer el corte de caja'
        );
    }
});

export const registrarGastoThunk = createAsyncThunk<
    MovimientoCaja,
    MovimientoCaja,
    { rejectValue: string }
>('caja/registrarGasto', async (movimiento, { rejectWithValue }) => {
    try {
        const gasto = await cajaService.registrarGasto(movimiento);
        return gasto;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al registrar el gasto'
        );
    }
});

export const registrarIngresoThunk = createAsyncThunk<
    MovimientoCaja,
    MovimientoCaja,
    { rejectValue: string }
>('caja/registrarIngreso', async (movimiento, { rejectWithValue }) => {
    try {
        const ingreso = await cajaService.registrarIngreso(movimiento);
        return ingreso;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al registrar el ingreso'
        );
    }
});

export const fetchCorteActualByCajaThunk = createAsyncThunk<
    MovimientoCaja[],
    number,
    { rejectValue: string }
>('caja/fetchCorteActualByCaja', async (cajaId, { rejectWithValue }) => {
    try {
        const caja = await cajaService.getMovimientosDelCorteActual(cajaId);
        return caja;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar el corte actual de la caja'
        );
    }
});
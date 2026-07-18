import { createAsyncThunk } from "@reduxjs/toolkit";
import { posService } from "./pos.service";
import { CrearOrdenDTO, EstadoOrden, MesaPosResponseDTO, OrdenResponseDTO, ProductosBySucursalResponse } from "./pos.types";

export const createOrdenThunk = createAsyncThunk<
    OrdenResponseDTO,
    CrearOrdenDTO,
    { rejectValue: string }
>('pos/create', async (data, { rejectWithValue }) => {
    try {
        const orden = await posService.createOrden(data);
        return orden;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al crear la orden'
        );
    }
});

export const fetchOrdenesBySucursalThunk = createAsyncThunk<
    OrdenResponseDTO[],
    number,
    { rejectValue: string }
>('pos/fetchBySucursal', async (sucursalId, { rejectWithValue }) => {
    try {
        const ordenes = await posService.getBySucursal(sucursalId);
        return ordenes;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar las ordenes'
        );
    }
});


export const fetchProductosBySucursalThunk = createAsyncThunk<
    ProductosBySucursalResponse[],
    number,
    { rejectValue: string }
>('pos/fetchProductosBySucursal', async (sucursalId, { rejectWithValue }) => {
    try {
        const productos = await posService.getProductosBySucursal(sucursalId);
        return productos;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar los productos'
        );
    }
});

export const fetchMesasBySucursalThunk = createAsyncThunk<
    MesaPosResponseDTO[],
    number,
    { rejectValue: string }
>('pos/fetchMesasBySucursal', async (sucursalId, { rejectWithValue }) => {
    try {
        const mesas = await posService.getMesasBySucursal(sucursalId);
        return mesas;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar las mesas'
        );
    }
});

export const updateOrdenEstadoThunk = createAsyncThunk<
    OrdenResponseDTO,
    { ordenId: number; estado: EstadoOrden },
    { rejectValue: string }
>('pos/updateOrdenEstado', async ({ ordenId, estado }, { rejectWithValue }) => {
    try {
        const orden = await posService.updateOrdenEstado(ordenId, estado);
        return orden;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al actualizar la orden'
        );
    }
});

export const cancelOrdenThunk = createAsyncThunk<
    number,
    { ordenId: number; motivo?: string },
    { rejectValue: string }
>('pos/cancelOrden', async ({ ordenId, motivo }, { rejectWithValue }) => {
    try {
        await posService.cancelarOrden(ordenId, motivo);
        return ordenId;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cancelar la orden'
        );
    }
});

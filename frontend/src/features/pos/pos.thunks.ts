import { createAsyncThunk } from "@reduxjs/toolkit";
import { CrearOrdenDTO, OrdenResponseDTO, ProductosBySucursalResponse } from "./pos.types";
import { posService } from "./pos.service";

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

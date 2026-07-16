import { createAsyncThunk } from '@reduxjs/toolkit';
import { inventarioService } from './inventario.service';
import { MaterialDTO } from './inventario.types';

export const fetchInventarioBySucursal = createAsyncThunk<
    MaterialDTO[],
    number,
    { rejectValue: string }
>('inventario/fetchInventarioBySucursal', async (sucursalId, { rejectWithValue }) => {
    try {
        const inventario = await inventarioService.getBySucursalId(sucursalId);
        return inventario;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar el inventario de la sucursal'
        );
    }
});

export const ajustarExistencia = createAsyncThunk<
    MaterialDTO,
    { materialId: number; cantidad: number },
    { rejectValue: string }
>('inventario/ajustarExistencia', async ({ materialId, cantidad }, { rejectWithValue }) => {
    try {
        const material = await inventarioService.ajustarExistencia(materialId, cantidad);
        return material;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al ajustar la existencia del material'
        );
    }
});

export const hacerProduccion = createAsyncThunk<
    MaterialDTO,
    { materialId: number; cantidad: number },
    { rejectValue: string }
>('inventario/hacerProduccion', async ({ materialId, cantidad }, { rejectWithValue }) => {
    try {
        const material = await inventarioService.hacerProduccion(materialId, cantidad);
        return material;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al realizar la producción del material'
        );
    }
});
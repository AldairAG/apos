import { createAsyncThunk } from '@reduxjs/toolkit';
import { recetaService } from './receta.service';
import { CrearRecetaDTO, Receta } from './receta.types';


export const fetchRecetas = createAsyncThunk<
    Receta[],
    void,
    { rejectValue: string }
>('recetas/fetchRecetas', async (_, { rejectWithValue }) => {
    try {   
        const recetas = await recetaService.getAll();
        return recetas;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar las recetas'
        );
    }
});

export const fetchRecetasBySucursal = createAsyncThunk<
    Receta[],
    number,
    { rejectValue: string }
>('recetas/fetchRecetasBySucursal', async (sucursalId, { rejectWithValue }) => {
    try {
        const recetas = await recetaService.getBySucursal(sucursalId);
        return recetas;
    }
    catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al cargar las recetas de la sucursal'
        );
    }
});

export const createReceta = createAsyncThunk<
    Receta,
    CrearRecetaDTO,
    { rejectValue: string }
>('recetas/createReceta', async (data, { rejectWithValue }) => {
    try {
        const receta = await recetaService.create(data);
        return receta;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al crear la receta'
        );
    }
});


export const updateReceta = createAsyncThunk<
    Receta,
    { id: number; data: Receta },
    { rejectValue: string }
>('recetas/updateReceta', async ({ id, data }, { rejectWithValue }) => {
    try {
        const receta = await recetaService.update(id, data);
        return receta;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al actualizar la receta'
        );
    }
});

export const deleteReceta = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>('recetas/deleteReceta', async (id, { rejectWithValue }) => {
    try {
        await recetaService.delete(id);
        return id;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || 'Error al eliminar la receta'
        );
    }
});





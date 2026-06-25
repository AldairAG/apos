import { createAsyncThunk } from '@reduxjs/toolkit';
import { mesaService } from './mesa.service';
import { CrearMesaDTO, EstadoMesa, Mesa } from './mesas.types';

export const fetchMesasBySucursal = createAsyncThunk<
  Mesa[],
  number,
  { rejectValue: string }
>('mesa/fetchBySucursal', async (sucursalId, { rejectWithValue }) => {
  try {
    return await mesaService.getBySucursal(sucursalId);
  } catch (error: any) {
    const message = error.message || error.response?.data?.message || 'Error al cargar las mesas';
    console.error('❌ fetchMesasBySucursal error:', message, error);
    return rejectWithValue(message);
  }
});

export const fetchMesaById = createAsyncThunk<
  Mesa,
  number,
  { rejectValue: string }
>('mesa/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await mesaService.getById(id);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error al cargar la mesa');
  }
});

export const createMesa = createAsyncThunk<
  Mesa,
  { sucursalId: number; data: CrearMesaDTO },
  { rejectValue: string }
>('mesa/create', async ({ sucursalId, data }, { rejectWithValue }) => {
  try {
    return await mesaService.create(sucursalId, data);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error al crear la mesa');
  }
});

export const updateMesa = createAsyncThunk<
  Mesa,
  { id: number; data: Mesa },
  { rejectValue: string }
>('mesa/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await mesaService.update(id, data);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error al actualizar la mesa');
  }
});

export const deleteMesa = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('mesa/delete', async (id, { rejectWithValue }) => {
  try {
    console.log(`🗑️ Eliminando mesa con ID: ${id}`);
    await mesaService.delete(id);
    console.log(`✅ Mesa ${id} eliminada exitosamente`);
    return id;
  } catch (error: any) {
    const message = error.message || error.response?.data?.message || 'Error al eliminar la mesa';
    console.error(`❌ Error al eliminar mesa ${id}:`, message, error);
    return rejectWithValue(message);
  }
});

export const changeMesaEstado = createAsyncThunk<
  Mesa,
  { id: number; nuevoEstado: EstadoMesa },
  { rejectValue: string }
>('mesa/changeEstado', async ({ id, nuevoEstado }, { rejectWithValue }) => {
  try {
    return await mesaService.cambiarEstado(id, nuevoEstado);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error al cambiar el estado de la mesa');
  }
});

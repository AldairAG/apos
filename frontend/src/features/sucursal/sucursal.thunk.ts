import { createAsyncThunk } from '@reduxjs/toolkit';
import { sucursalService } from './sucursal.service';
import { CreateSucursalDTO, Sucursal } from './sucursal.types';

export const fetchSucursales = createAsyncThunk<
  Sucursal[],
  number,
  { rejectValue: string }
>('sucursal/fetchSucursales', async (id, { rejectWithValue }) => {
  try {
    const sucursales = await sucursalService.getAll(id);
    return sucursales;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar las sucursales'
    );
  }
});

export const createSucursal = createAsyncThunk<
  Sucursal,
  CreateSucursalDTO,
  { rejectValue: string }
>('sucursal/createSucursal', async (data, { rejectWithValue }) => {
  try {
    const sucursal = await sucursalService.create(data);
    return sucursal;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al crear la sucursal'
    );
  }
});

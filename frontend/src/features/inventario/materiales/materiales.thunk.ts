import { createAsyncThunk } from '@reduxjs/toolkit';
import { materialesService } from './materiales.service';
import { CreateMaterialDTO, Material, UpdateMaterialDTO } from './materiales.types';

// Fetch todos los materiales
export const fetchMateriales = createAsyncThunk<
  Material[],
  void,
  { rejectValue: string }
>('materiales/fetchMateriales', async (_, { rejectWithValue }) => {
  try {
    const materiales = await materialesService.getAll();
    return materiales;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar los materiales'
    );
  }
});

// Fetch materiales por sucursal
export const fetchMaterialesBySucursal = createAsyncThunk<
  Material[],
  number,
  { rejectValue: string }
>('materiales/fetchMaterialesBySucursal', async (sucursalId, { rejectWithValue }) => {
  try {
    const materiales = await materialesService.getBySucursal(sucursalId);
    return materiales;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar los materiales de la sucursal'
    );
  }
});

// Create material
export const createMaterial = createAsyncThunk<
  Material,
  CreateMaterialDTO,
  { rejectValue: string }
>('materiales/createMaterial', async (data, { rejectWithValue }) => {
  try {
    const material = await materialesService.create(data);
    return material;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al crear el material'
    );
  }
});

// Update material
export const updateMaterial = createAsyncThunk<
  Material,
  { id: number; data: UpdateMaterialDTO },
  { rejectValue: string }
>('materiales/updateMaterial', async ({ id, data }, { rejectWithValue }) => {
  try {
    const material = await materialesService.update(id, data);
    return material;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al actualizar el material'
    );
  }
});

// Delete material
export const deleteMaterial = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('materiales/deleteMaterial', async (id, { rejectWithValue }) => {
  try {
    await materialesService.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al eliminar el material'
    );
  }
});

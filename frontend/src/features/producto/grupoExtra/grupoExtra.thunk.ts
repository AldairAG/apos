import { createAsyncThunk } from '@reduxjs/toolkit';
import { grupoExtraService } from './grupoExtra.service';
import {
    CreateGrupoExtraDTO,
    CreateOpcionExtraDTO,
    GrupoExtra,
    OpcionExtra,
    UpdateGrupoExtraDTO,
    UpdateOpcionExtraDTO
} from './grupoExtra.types';

// ========== Thunks para Grupos Extra ==========
export const fetchGruposExtra = createAsyncThunk<
  GrupoExtra[],
  void,
  { rejectValue: string }
>('grupoExtra/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const grupos = await grupoExtraService.getAll();
    return grupos;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar los grupos extra'
    );
  }
});

export const fetchGrupoExtraById = createAsyncThunk<
  GrupoExtra,
  number,
  { rejectValue: string }
>('grupoExtra/fetchById', async (id, { rejectWithValue }) => {
  try {
    const grupo = await grupoExtraService.getById(id);
    return grupo;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar el grupo extra'
    );
  }
});

export const createGrupoExtra = createAsyncThunk<
  GrupoExtra,
  CreateGrupoExtraDTO,
  { rejectValue: string }
>('grupoExtra/create', async (data, { rejectWithValue }) => {
  try {
    const grupo = await grupoExtraService.create(data);
    return grupo;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al crear el grupo extra'
    );
  }
});

export const updateGrupoExtra = createAsyncThunk<
  GrupoExtra,
  { id: number; data: UpdateGrupoExtraDTO },
  { rejectValue: string }
>('grupoExtra/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const grupo = await grupoExtraService.update(id, data);
    return grupo;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al actualizar el grupo extra'
    );
  }
});

export const deleteGrupoExtra = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('grupoExtra/delete', async (id, { rejectWithValue }) => {
  try {
    await grupoExtraService.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al eliminar el grupo extra'
    );
  }
});

// ========== Thunks para Opciones Extra ==========
export const fetchOpcionesByGrupo = createAsyncThunk<
  OpcionExtra[],
  number,
  { rejectValue: string }
>('grupoExtra/fetchOpciones', async (grupoId, { rejectWithValue }) => {
  try {
    const opciones = await grupoExtraService.getOpcionesByGrupo(grupoId);
    return opciones;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar las opciones'
    );
  }
});

export const createOpcionExtra = createAsyncThunk<
  OpcionExtra,
  CreateOpcionExtraDTO,
  { rejectValue: string }
>('grupoExtra/createOpcion', async (data, { rejectWithValue }) => {
  try {
    const opcion = await grupoExtraService.createOpcion(data);
    return opcion;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al crear la opción'
    );
  }
});

export const updateOpcionExtra = createAsyncThunk<
  OpcionExtra,
  { id: number; data: UpdateOpcionExtraDTO },
  { rejectValue: string }
>('grupoExtra/updateOpcion', async ({ id, data }, { rejectWithValue }) => {
  try {
    const opcion = await grupoExtraService.updateOpcion(id, data);
    return opcion;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al actualizar la opción'
    );
  }
});

export const deleteOpcionExtra = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('grupoExtra/deleteOpcion', async (id, { rejectWithValue }) => {
  try {
    await grupoExtraService.deleteOpcion(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al eliminar la opción'
    );
  }
});

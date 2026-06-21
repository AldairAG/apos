import { createAsyncThunk } from '@reduxjs/toolkit';
import { categoriaService } from './categoria.service';
import { Categoria, CreateCategoriaDTO, UpdateCategoriaDTO } from './categoria.types';

export const fetchCategorias = createAsyncThunk<
  Categoria[],
  void,
  { rejectValue: string }
>('categoria/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const categorias = await categoriaService.getAll();
    return categorias;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar las categorías'
    );
  }
});

export const fetchCategoriaById = createAsyncThunk<
  Categoria,
  number,
  { rejectValue: string }
>('categoria/fetchById', async (id, { rejectWithValue }) => {
  try {
    const categoria = await categoriaService.getById(id);
    return categoria;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar la categoría'
    );
  }
});

export const createCategoria = createAsyncThunk<
  Categoria,
  CreateCategoriaDTO,
  { rejectValue: string }
>('categoria/create', async (data, { rejectWithValue }) => {
  try {
    const categoria = await categoriaService.create(data);
    return categoria;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al crear la categoría'
    );
  }
});

export const updateCategoria = createAsyncThunk<
  Categoria,
  UpdateCategoriaDTO,
  { rejectValue: string }
>('categoria/update', async (data, { rejectWithValue }) => {
  try {
    const categoria = await categoriaService.update(data.id, data);
    return categoria;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al actualizar la categoría'
    );
  }
});

export const deleteCategoria = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('categoria/delete', async (id, { rejectWithValue }) => {
  try {
    await categoriaService.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al eliminar la categoría'
    );
  }
});

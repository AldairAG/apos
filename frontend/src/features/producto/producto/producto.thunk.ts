import { createAsyncThunk } from '@reduxjs/toolkit';
import { CreateProductoDTO, productoService, UpdateProductoDTO } from './producto.service';
import { Producto } from './producto.types';

export const fetchProductosBySucursal = createAsyncThunk<
  Producto[],
  number,
  { rejectValue: string }
>('producto/fetchBySucursal', async (sucursalId, { rejectWithValue }) => {
  try {
    const productos = await productoService.getBySucursal(sucursalId);
    return productos;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar los productos'
    );
  }
});

export const searchProductos = createAsyncThunk<
  Producto[],
  { sucursalId: number; query: string },
  { rejectValue: string }
>('producto/search', async ({ sucursalId, query }, { rejectWithValue }) => {
  try {
    const productos = await productoService.search(sucursalId, query);
    return productos;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al buscar productos'
    );
  }
});

export const fetchProductoById = createAsyncThunk<
  Producto,
  number,
  { rejectValue: string }
>('producto/fetchById', async (id, { rejectWithValue }) => {
  try {
    const producto = await productoService.getById(id);
    return producto;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cargar el producto'
    );
  }
});

export const createProducto = createAsyncThunk<
  Producto,
  CreateProductoDTO,
  { rejectValue: string }
>('producto/create', async (data, { rejectWithValue }) => {
  try {
    const producto = await productoService.create(data);
    return producto;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al crear el producto'
    );
  }
});

export const updateProducto = createAsyncThunk<
  Producto,
  { id: number; data: UpdateProductoDTO },
  { rejectValue: string }
>('producto/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const producto = await productoService.update(id, data);
    return producto;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al actualizar el producto'
    );
  }
});

export const deleteProducto = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('producto/delete', async (id, { rejectWithValue }) => {
  try {
    await productoService.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al eliminar el producto'
    );
  }
});

export const toggleProductoDisponibilidad = createAsyncThunk<
  Producto,
  number,
  { rejectValue: string }
>('producto/toggleDisponibilidad', async (id, { rejectWithValue }) => {
  try {
    const producto = await productoService.toggleDisponibilidad(id);
    return producto;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Error al cambiar disponibilidad'
    );
  }
});

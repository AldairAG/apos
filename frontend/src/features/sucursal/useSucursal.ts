import { AppDispatch, RootState } from '@/store';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearSucursalActual, setSucursalActual } from './sucursal.slice';
import { createSucursal, fetchSucursales } from './sucursal.thunk';
import { CreateSucursalDTO, Sucursal } from './sucursal.types';

export const useSucursal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sucursalActual, sucursales, loading, error } = useSelector(
    (state: RootState) => state.sucursal
  );

  const idUsuario = useSelector((state: RootState) => state.auth.id);

  // Seleccionar sucursal
  const seleccionarSucursal = useCallback(
    (sucursal: Sucursal) => {
      dispatch(setSucursalActual(sucursal));
    },
    [dispatch]
  );

  // Limpiar sucursal actual
  const limpiarSucursal = useCallback(() => {
    dispatch(clearSucursalActual());
  }, [dispatch]);

  // Crear nueva sucursal
  const crearSucursal = useCallback(
    async (data: CreateSucursalDTO) => {
      const result = await dispatch(createSucursal(data));
      if (createSucursal.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  // Recargar sucursales
  const recargarSucursales = useCallback(() => {
    if (idUsuario) {
      dispatch(fetchSucursales(Number(idUsuario)));
    }
  }, [dispatch, idUsuario]);

  // Limpiar error
  const limpiarError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    sucursalActual,
    sucursales,
    loading,
    error,
    seleccionarSucursal,
    limpiarSucursal,
    crearSucursal,
    recargarSucursales,
    limpiarError,
  };
};

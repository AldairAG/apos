import { AppDispatch, RootState } from '@/store';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearMateriales, setMaterialSeleccionado } from './materiales.slice';
import {
    createMaterial,
    deleteMaterial,
    fetchMateriales,
    fetchMaterialesBySucursal,
    updateMaterial,
} from './materiales.thunk';
import { CreateMaterialDTO, Material, UpdateMaterialDTO } from './materiales.types';

export const useMateriales = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { materiales, materialSeleccionado, loading, error } = useSelector(
    (state: RootState) => state.materiales
  );

  // Cargar todos los materiales
  const cargarMateriales = useCallback(() => {
    dispatch(fetchMateriales());
  }, [dispatch]);

  // Cargar materiales por sucursal
  const cargarMaterialesBySucursal = useCallback(
    (sucursalId: number) => {
      dispatch(fetchMaterialesBySucursal(sucursalId));
    },
    [dispatch]
  );

  // Seleccionar material
  const seleccionarMaterial = useCallback(
    (material: Material | null) => {
      dispatch(setMaterialSeleccionado(material));
    },
    [dispatch]
  );

  // Crear nuevo material
  const crearMaterial = useCallback(
    async (data: CreateMaterialDTO) => {
      const result = await dispatch(createMaterial(data));
      if (createMaterial.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  // Actualizar material
  const actualizarMaterial = useCallback(
    async (id: number, data: UpdateMaterialDTO) => {
      const result = await dispatch(updateMaterial({ id, data }));
      if (updateMaterial.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  // Eliminar material
  const eliminarMaterial = useCallback(
    async (id: number) => {
      const result = await dispatch(deleteMaterial(id));
      if (deleteMaterial.fulfilled.match(result)) {
        return { success: true };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch]
  );

  // Limpiar materiales
  const limpiarMateriales = useCallback(() => {
    dispatch(clearMateriales());
  }, [dispatch]);

  // Limpiar error
  const limpiarError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    materiales,
    materialSeleccionado,
    loading,
    error,
    cargarMateriales,
    cargarMaterialesBySucursal,
    seleccionarMaterial,
    crearMaterial,
    actualizarMaterial,
    eliminarMaterial,
    limpiarMateriales,
    limpiarError,
  };
};
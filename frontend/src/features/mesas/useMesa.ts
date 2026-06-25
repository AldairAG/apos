import { useSucursal } from '@/features/sucursal/useSucursal';
import { AppDispatch, RootState } from '@/store';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, setSelectedMesa } from './mesa.slice';
import {
    changeMesaEstado,
    createMesa,
    deleteMesa,
    fetchMesaById,
    fetchMesasBySucursal,
    updateMesa,
} from './mesa.thunk';
import { CrearMesaDTO, EstadoMesa, Mesa } from './mesas.types';

export const useMesa = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mesaState = useSelector((state: RootState) => state.mesas) ?? {
    mesas: [],
    selectedMesa: null,
    loading: false,
    error: null,
  };
  const { selectedMesa, mesas, loading, error } = mesaState;
  const { sucursalActual } = useSucursal();

  const cargarMesas = useCallback(() => {
    if (!sucursalActual) return;
    return dispatch(fetchMesasBySucursal(sucursalActual.id));
  }, [dispatch, sucursalActual]);

  const cargarMesa = useCallback(
    (id: number) => {
      return dispatch(fetchMesaById(id));
    },
    [dispatch]
  );

  const handleCreateMesa = useCallback(
    (data: CrearMesaDTO) => {
      if (!sucursalActual) return;
      return dispatch(createMesa({ sucursalId: sucursalActual.id, data }));
    },
    [dispatch, sucursalActual]
  );

  const handleUpdateMesa = useCallback(
    (id: number, data: Mesa) => {
      return dispatch(updateMesa({ id, data }));
    },
    [dispatch]
  );

  const handleDeleteMesa = useCallback(
    (id: number) => {
      return dispatch(deleteMesa(id));
    },
    [dispatch]
  );

  const handleChangeMesaEstado = useCallback(
    (id: number, nuevoEstado: EstadoMesa) => {
      return dispatch(changeMesaEstado({ id, nuevoEstado }));
    },
    [dispatch]
  );

  const seleccionarMesa = useCallback(
    (mesa: Mesa | null) => {
      dispatch(setSelectedMesa(mesa));
    },
    [dispatch]
  );

  const limpiarError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    selectedMesa,
    mesas,
    loading,
    error,
    sucursalActual,
    cargarMesas,
    cargarMesa,
    createMesa: handleCreateMesa,
    updateMesa: handleUpdateMesa,
    deleteMesa: handleDeleteMesa,
    changeMesaEstado: handleChangeMesaEstado,
    setSelectedMesa: seleccionarMesa,
    clearError: limpiarError,
  };
};

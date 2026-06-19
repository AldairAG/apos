import { AppDispatch, RootState } from '@/store';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearRecetas, setRecetaSeleccionada } from './receta.slice';
import {
    createReceta,
    deleteReceta,
    fetchRecetas,
    fetchRecetasBySucursal,
    updateReceta,
} from './receta.thunks';
import { Receta } from './receta.types';

export const useRecetas = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { recetas, recetaSeleccionada, loading, error } = useSelector(
        (state: RootState) => state.recetas
    );
    // Cargar todas las recetas
    const cargarRecetas = useCallback(() => {
        dispatch(fetchRecetas());
    }, [dispatch]);

    // Cargar recetas por sucursal
    const cargarRecetasBySucursal = useCallback(
        (sucursalId: number) => {
            dispatch(fetchRecetasBySucursal(sucursalId));
        }, [dispatch]
    );
    // Seleccionar receta
    const seleccionarReceta = useCallback((receta: Receta | null) => {
        dispatch(setRecetaSeleccionada(receta));
    }, [dispatch]);

    // Crear nueva receta
    const crearReceta = useCallback(async (data: Receta) => {
        const result = await dispatch(createReceta(data));
        if (createReceta.fulfilled.match(result)) {
            return { success: true, data: result.payload };
        }
        return { success: false, error: result.payload as string };
    }, [dispatch]);


      // Limpiar recetas
      const limpiarRecetas = useCallback(() => {
        dispatch(clearRecetas());
      }, [dispatch]);
    
      // Limpiar error
      const limpiarError = useCallback(() => {
        dispatch(clearError());
      }, [dispatch]);


      return {
        recetas,
        recetaSeleccionada,
        loading,
        error,
        cargarRecetas,
        cargarRecetasBySucursal,
        seleccionarReceta,
        crearReceta,
        limpiarRecetas,
        limpiarError,
    };
}

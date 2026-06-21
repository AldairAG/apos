import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCategoria, fetchCategorias, updateCategoria } from "./categoria.thunk";
import { CreateCategoriaDTO, UpdateCategoriaDTO } from "./categoria.types";

export const useCategoria = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { categorias, selectedCategoria, loading, error } = useSelector(
        (state: RootState) => state.categorias
    );
    // Cargar todas las categorías
    const cargarCategorias = useCallback(() => {
        dispatch(fetchCategorias());
    }, [dispatch]);

    const handleSaveCategoria = async (data: CreateCategoriaDTO | UpdateCategoriaDTO) => {
        if ('id' in data) {
            // Actualizar categoría
            const result = await dispatch(updateCategoria(data));
            if (updateCategoria.fulfilled.match(result)) {
                return { success: true, data: result.payload };
            }
            return { success: false, error: result.payload as string };
        } else {
            // Crear nueva categoría
            const result = await dispatch(createCategoria(data));
            if (createCategoria.fulfilled.match(result)) {
                return { success: true, data: result.payload };
            }
            return { success: false, error: result.payload as string };
        }
    };

    return {
        categorias,
        selectedCategoria,
        loading,
        error,
        cargarCategorias,
        saveCategoria: handleSaveCategoria,
    };

}
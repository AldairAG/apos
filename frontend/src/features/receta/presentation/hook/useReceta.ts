import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FindRecetasParams, findRecetasThunk } from "../../aplication/query/FindRecetasThunk";
import { crearRecetaThunk } from "../../aplication/usecase/CrearRecetaThunk";
import { deleteRecetaThunk } from "../../aplication/usecase/DeleteRecetaThunk";
import { updateRecetaThunk } from "../../aplication/usecase/UpdateRecetaThunk";
import { RecetaDto } from "../../domain/types/receta.types";

export const useReceta = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { recetas, pageInfo, loading, error } = useSelector(
        (state: RootState) => state.receta
    );

    const findRecetas = useCallback((params?: FindRecetasParams) => {
        dispatch(findRecetasThunk(params));
    }, [dispatch]);

    const crearReceta = (receta: RecetaDto) => {
        dispatch(crearRecetaThunk(receta));
    };

    const deleteReceta = useCallback((recetaId: number) => {
        dispatch(deleteRecetaThunk(recetaId));
    }, [dispatch]);

    const updateReceta = useCallback((recetaId: number, receta: RecetaDto) => {
        dispatch(updateRecetaThunk({ id: recetaId, receta }));
    }, [dispatch]);

    return {
        recetas,
        pageInfo,
        loading,
        error,
        findRecetas,
        crearReceta,
        deleteReceta,
        updateReceta,
    };
};

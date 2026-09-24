import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FindRecetasParams, findRecetasThunk } from "../../aplication/query/FindRecetasThunk";
import { crearRecetaThunk } from "../../aplication/usecase/CrearRecetaThunk";
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

    return {
        recetas,
        pageInfo,
        loading,
        error,
        findRecetas,
        crearReceta,
    };
};

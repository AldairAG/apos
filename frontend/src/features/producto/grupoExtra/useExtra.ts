import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGruposExtra,createGrupoExtra } from "./grupoExtra.thunk";

export const useExtra = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { grupos, selectedGrupo, loading, error } = useSelector(
        (state: RootState) => state.gruposExtra
    );
    // Cargar todos los grupos
    const cargarGrupos = useCallback(() => {
        dispatch(fetchGruposExtra());
    }, [dispatch]);

    const handleSaveGrupo = async (data: any) => {
        const result = await dispatch(createGrupoExtra(data));
        if (result.meta.requestStatus === "fulfilled") {
            return { success: true, data: result.payload };
        }
        return { success: false, error: result.payload as string };
    };

    return {
        grupos,
        selectedGrupo,
        loading,
        error,
        cargarGrupos,
        saveGrupo: handleSaveGrupo,
    }


}
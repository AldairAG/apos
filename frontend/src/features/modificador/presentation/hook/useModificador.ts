import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findModificadoresByEmpresaThunk } from "../../aplication/query/FindModificadoresByEmpresaThunk";
import { crearModificadorThunk } from "../../aplication/usecase/CrearModificadorThunk";
import type { ModificadorDto } from "../../domain/types/modificador.types";

export const useModificador = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { modificadores, loading, error } = useSelector(
        (state: RootState) => state.modificador
    );

    const findModificadoresByEmpresa = () => {
        dispatch(findModificadoresByEmpresaThunk());
    };

    const crearModificador = (modificador: ModificadorDto) => {
        dispatch(crearModificadorThunk(modificador));
    };

    return {
        modificadores,
        loading,
        error,
        findModificadoresByEmpresa,
        crearModificador,
    };
};
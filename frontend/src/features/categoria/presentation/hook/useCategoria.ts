import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findCategoriasByEmpresaThunk } from "../../aplication/query/FindCategoriasByEmpresaThunk";
import { crearCategoriaThunk } from "../../aplication/usecase/CrearCategoriaThunk";
import type { CategoriaDto } from "../../domain/types/categoria.types";

export const useCategoria = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { categorias, loading, error } = useSelector(
        (state: RootState) => state.categoria
    );

    const { usuario } = useSelector(
        (state: RootState) => state.usuario
    );

    const findCategoriasByEmpresa = () => {
        return dispatch(findCategoriasByEmpresaThunk(usuario?.empresa?.id ||0));
    };

    const crearCategoria = (categoria: CategoriaDto) => {
        return dispatch(crearCategoriaThunk(categoria));
    };

    return {
        categorias,
        loading,
        error,
        findCategoriasByEmpresa,
        crearCategoria,
    };
};

import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findCategoriasBySucursalThunk } from "../../aplication/query/FindCategoriasBySucursalThunk";
import { crearCategoriaThunk } from "../../aplication/usecase/CrearCategoriaThunk";
import type { CategoriaDto } from "../../domain/types/categoria.types";

export const useCategoria = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { categorias, loading, error } = useSelector(
        (state: RootState) => state.categoria
    );

    const findCategoriasBySucursal = (sucursalId: number) => {
        return dispatch(findCategoriasBySucursalThunk(sucursalId));
    };

    const crearCategoria = (categoria: CategoriaDto) => {
        return dispatch(crearCategoriaThunk(categoria));
    };

    return {
        categorias,
        loading,
        error,
        findCategoriasBySucursal,
        crearCategoria,
    };
};

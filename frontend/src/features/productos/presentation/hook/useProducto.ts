import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findProductosBySucursalThunk } from "../../aplication/query/FindProductosBySucursalThunk";
import { crearProductoThunk } from "../../aplication/usecase/CrearProductoThunk";
import type { ProductoDto } from "../../domain/types/producto.types";
import { limpiarErrorProducto, limpiarProductos } from "../../store/producto.slice";

export const useProducto = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { productos, loading, error } = useSelector((state: RootState) => state.producto);

    const findProductosBySucursal = (sucursalId: number) =>
        dispatch(findProductosBySucursalThunk(sucursalId));

    const crearProducto = (producto: ProductoDto) =>
        dispatch(crearProductoThunk(producto));

    return {
        productos,
        loading,
        error,
        findProductosBySucursal,
        crearProducto,
        limpiarError: () => dispatch(limpiarErrorProducto()),
        limpiarProductos: () => dispatch(limpiarProductos()),
    };
};
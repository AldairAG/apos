import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findProductosByEmpresaThunk } from "../../aplication/query/FindProductosByEmpresaThunk";
import { crearProductoThunk } from "../../aplication/usecase/CrearProductoThunk";
import { actualizarProductoThunk } from "../../aplication/usecase/ActualizarProductoThunk";
import { eliminarProductoThunk } from "../../aplication/usecase/EliminarProductoThunk";
import type { CrearProductoPayload, ProductoDto } from "../../domain/types/producto.types";
import { limpiarErrorProducto, limpiarProductos } from "../../store/producto.slice";

export const useProducto = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { productos, loading, error } = useSelector((state: RootState) => state.producto);

    const empresaId = useSelector((state: RootState) => state.usuario?.usuario?.empresa.id);

    const findProductosByEmpresa = () =>
        dispatch(findProductosByEmpresaThunk(empresaId??0));

    const crearProducto = (payload: CrearProductoPayload) =>
        dispatch(crearProductoThunk(payload));

    const actualizarProducto = (producto: ProductoDto) =>
        dispatch(actualizarProductoThunk(producto));

    const eliminarProducto = (productoId: number) =>
        dispatch(eliminarProductoThunk(productoId));

    return {
        productos,
        loading,
        error,
        findProductosByEmpresa,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        limpiarError: () => dispatch(limpiarErrorProducto()),
        limpiarProductos: () => dispatch(limpiarProductos()),
    };
};
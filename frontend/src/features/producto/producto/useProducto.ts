import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProducto, fetchProductosBySucursal } from "./producto.thunk";
import { useSucursal } from "@/features/sucursal/useSucursal";
import { createProductoDTO } from "./producto.types";

export const useProducto=()=>{
     const dispatch = useDispatch<AppDispatch>();
    const { selectedProducto, productos, loading, error } = useSelector(
        (state: RootState) => state.productos
    );
    const {sucursalActual}= useSucursal();
    // Cargar todas las categorías
    const cargarProductos = useCallback(() => {
        dispatch(fetchProductosBySucursal(sucursalActual?.id || 0));
    }, [dispatch, sucursalActual]);

    const handleSaveProducto = async (data: createProductoDTO) => {
        dispatch(createProducto(data));
    };

    return{
        selectedProducto,
        productos,
        loading,
        error,
        saveProducto:handleSaveProducto,
        cargarProductos,
    }
}
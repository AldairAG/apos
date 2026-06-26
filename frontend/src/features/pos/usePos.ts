import { AppDispatch } from "@/store";
import { createOrdenThunk, fetchOrdenesBySucursalThunk, fetchProductosBySucursalThunk } from "./pos.thunks";
import { CrearOrdenDTO } from "./pos.types";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { useSucursal } from "../sucursal/useSucursal";


const usePos = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, productos } = useSelector((state: any) => state.pos);
    const { sucursalActual } = useSucursal();

    const cargarProductos = useCallback(() => {
        dispatch(fetchProductosBySucursalThunk(sucursalActual?.id || 0));
    }, [dispatch, sucursalActual]);

    const cargarOrdenes = useCallback(() => {
        dispatch(fetchOrdenesBySucursalThunk(sucursalActual?.id || 0));
    }, [dispatch, sucursalActual]);

    const createOrden = async (data: CrearOrdenDTO) => {
        try {
            const orden = await dispatch(createOrdenThunk(data)).unwrap();
            return orden;
        } catch (error) {
            console.error('Error al crear la orden:', error);
            throw error;
        }
    };

    const fetchOrdenesBySucursal = async (sucursalId: number) => {
        try {
            const ordenes = await dispatch(fetchOrdenesBySucursalThunk(sucursalId)).unwrap();
            return ordenes;
        } catch (error) {
            console.error('Error al cargar las ordenes:', error);
            throw error;
        }
    };

    const fetchProductosBySucursal = async (sucursalId: number) => {
        try {
            const productos = await dispatch(fetchProductosBySucursalThunk(sucursalId)).unwrap();
            return productos;
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            throw error;
        }
    };

    return {
        loading,
        error,
        productos,
        crearOrden: createOrden,
        getOrdenesBySucursal: fetchOrdenesBySucursal,
        getProductosBySucursal: fetchProductosBySucursal,
        cargarProductos,
        cargarOrdenes,
    };
};

export default usePos;
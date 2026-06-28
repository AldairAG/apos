import { AppDispatch, RootState } from "@/store";
import { createOrdenThunk, fetchMesasBySucursalThunk, fetchOrdenesBySucursalThunk, fetchProductosBySucursalThunk } from "./pos.thunks";
import { CrearOrdenDTO, MesaPosResponseDTO } from "./pos.types";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { useSucursal } from "../sucursal/useSucursal";


const usePos = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, productos, mesas, selectedMesa, ordenes } = useSelector((state: RootState) => state.pos);
    const { sucursalActual } = useSucursal();

    const cargarProductos = useCallback(() => {
        dispatch(fetchProductosBySucursalThunk(sucursalActual?.id || 0));
    }, [dispatch, sucursalActual]);

    const cargarOrdenes = useCallback(() => {
        dispatch(fetchOrdenesBySucursalThunk(sucursalActual?.id || 0));
    }, [dispatch, sucursalActual]);

    const cargarMesas = useCallback(() => {
        dispatch(fetchMesasBySucursalThunk(sucursalActual?.id || 0));
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

    const fetchMesasBySucursal = async (sucursalId: number) => {
        try {
            const mesas = await dispatch(fetchMesasBySucursalThunk(sucursalId)).unwrap();
            return mesas;
        } catch (error) {
            console.error('Error al cargar las mesas:', error);
            throw error;
        }
    };

    const selectMesa = (mesaId: number) => {
        const mesa = mesas.find((m: MesaPosResponseDTO) => m.id === mesaId) || null;
        dispatch({ type: 'pos/setSelectedMesa', payload: mesa });
    }

    return {
        mesas,
        selectedMesa,
        loading,
        error,
        productos,
        ordenes,
        crearOrden: createOrden,
        getOrdenesBySucursal: fetchOrdenesBySucursal,
        getProductosBySucursal: fetchProductosBySucursal,
        cargarProductos,
        cargarOrdenes,
        cargarMesas,
        seleccionarMesa: selectMesa,
        getMesasBySucursal: fetchMesasBySucursal,
    };
};

export default usePos;

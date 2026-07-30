import { useSucursal } from "@/features/sucursal/useSucursal";
import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    abrirCajaThunk, cerrarCajaThunk, crearCajaThunk,
    fetchCajasBySucursalThunk, fetchCorteActualByCajaThunk, fetchMovimientosByCajaThunk,
    hacerCorteCajaThunk, registrarGastoThunk,
    registrarIngresoThunk
} from "./caja.thunk";
import { CrearCajaRequest, MovimientoCaja } from "./caja.types";

const useCaja = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, cajas, cajaSeleccionada, MovimientosCaja, corteActual } = useSelector((state: RootState) => state.caja);
    const { sucursalActual } = useSucursal();

    const cargarCajas = useCallback(() => {
        if (!sucursalActual) return;
        dispatch(fetchCajasBySucursalThunk(sucursalActual.id));
    }, [dispatch, sucursalActual]);

    const fetchCajasBySucursal = async (sucursalId: number) => {
        try {
            const cajas = await dispatch(fetchCajasBySucursalThunk(sucursalId)).unwrap();
            return cajas;
        } catch (error) {
            console.error('Error al cargar las cajas:', error);
            throw error;
        }
    };

    const seleccionarCaja = async (cajaId: number) => {
        try {
            const caja = await dispatch(fetchMovimientosByCajaThunk(cajaId)).unwrap();
            return caja;
        } catch (error) {
            console.error('Error al cargar los movimientos de la caja:', error);
            throw error;
        }
    };

    const crearCaja = async (data: CrearCajaRequest) => {
        try {
            const caja = await dispatch(crearCajaThunk(data)).unwrap();
            return caja;
        } catch (error) {
            console.error('Error al crear la caja:', error);
            throw error;
        }
    };

    const abrirCaja = async (cajaId: number) => {
        try {
            const caja = await dispatch(abrirCajaThunk(cajaId)).unwrap();
            return caja;
        } catch (error) {
            console.error('Error al abrir la caja:', error);
            throw error;
        }
    };

    const cerrarCaja = async (cajaId: number) => {
        try {
            const caja = await dispatch(cerrarCajaThunk(cajaId)).unwrap();
            return caja;
        } catch (error) {
            console.error('Error al cerrar la caja:', error);
            throw error;
        }
    };

    const hacerCorteCaja = async (cajaId: number) => {
        try {
            const caja = await dispatch(hacerCorteCajaThunk(cajaId)).unwrap();
            return caja;
        } catch (error) {
            console.error('Error al hacer el corte de caja:', error);
            throw error;
        }
    };

    const registrarGasto = async (movimiento: MovimientoCaja) => {
        try {
            const gasto = await dispatch(registrarGastoThunk(movimiento)).unwrap();
            return gasto;
        } catch (error) {
            console.error('Error al registrar el gasto:', error);
            throw error;
        }
    };

    const registrarIngreso = async (movimiento: MovimientoCaja) => {
        try {
            const ingreso = await dispatch(registrarIngresoThunk(movimiento)).unwrap();
            return ingreso;
        } catch (error) {
            console.error('Error al registrar el ingreso:', error);
            throw error;
        }
    };

    const fetchMovimientosDelCorteActual = async (cajaId: number) => {
        try {
            const movimientos = await dispatch(fetchCorteActualByCajaThunk(cajaId)).unwrap();
            return movimientos;
        } catch (error) {
            console.error('Error al cargar los movimientos del corte actual de la caja:', error);
            throw error;
        }
    };

    return {
        sucursalActual,
        loading,
        error,
        cajas,
        cajaSeleccionada,
        MovimientosCaja,
        corteActual,
        cargarCajas,
        fetchCajasBySucursal,
        seleccionarCaja,
        crearCaja,
        abrirCaja,
        cerrarCaja,
        hacerCorteCaja,
        registrarGasto,
        registrarIngreso,
        fetchMovimientosDelCorteActual,
    };
};

export default useCaja;
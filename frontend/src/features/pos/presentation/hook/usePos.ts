import { findCajasBySucursalIdThunk } from "@/features/caja/aplication/query/FindCajasBySucursalId.thunk";
import { findCorteCajaByCajaIdThunk } from "@/features/caja/aplication/query/FindCorteCajaByCajaId.thunk";
import { EstadoCaja } from "@/features/caja/enum/Caja.Enums";
import { seleccionarCaja } from "@/features/caja/store/CajaSlice";
import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findOrdenesBySucursalIdThunk } from "../../aplication/query/FindOrdenesBySucursalIdThunk";
import { findProductosPosBySucursalIdThunk } from "../../aplication/query/FindProductosBySucursalIdThunk";
import { actualizarEstadoOrdenThunk } from "../../aplication/usecase/ActualizarEstadoOrdenThunk";
import { cobrarOrdenThunk } from "../../aplication/usecase/CobrarOrdenThunk";
import { crearOrdenThunk } from "../../aplication/usecase/CrearOrdenThunk";
import type { OrdenDto, PagarVentaDto } from "../../domain/types/pos.types";
import { limpiarErrorPos } from "../../store/pos.slice";

export const usePos = () => {
    const dispatch = useDispatch<AppDispatch>();
    const pos = useSelector((state: RootState) => state.pos);
    const sucursalId = useSelector(
        (state: RootState) => state.sucursal.sucursalSeleccionadaId
    );
    const { cajas, cajaSeleccionadaId, corteCaja, loading: cajaLoading, error: cajaError } =
        useSelector((state: RootState) => state.caja);
    const cajaAbierta = cajas.find(
        (caja) => caja.id === cajaSeleccionadaId && caja.estado === EstadoCaja.ABIERTA
    ) ?? null;

    const cargarProductos = useCallback(
        (id: number) => dispatch(findProductosPosBySucursalIdThunk(id)),
        [dispatch]
    );
    const cargarOrdenes = useCallback(
        (id: number) => dispatch(findOrdenesBySucursalIdThunk(id)),
        [dispatch]
    );
    const cargarContextoCaja = useCallback(async (id: number) => {
        try {
            const respuestaCajas = await dispatch(findCajasBySucursalIdThunk(id)).unwrap();
            const abierta = respuestaCajas.data.find(
                (caja) => caja.estado === EstadoCaja.ABIERTA
            );
            if (!abierta) return false;
            dispatch(seleccionarCaja(abierta.id));
            await dispatch(findCorteCajaByCajaIdThunk(abierta.id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const crearOrden = useCallback(
        (orden: OrdenDto) => dispatch(crearOrdenThunk(orden)),
        [dispatch]
    );
    const actualizarEstadoOrden = useCallback(
        (ordenId: number) => dispatch(actualizarEstadoOrdenThunk(ordenId)),
        [dispatch]
    );
    const cobrarOrden = useCallback(
        (pago: PagarVentaDto) => dispatch(cobrarOrdenThunk(pago)),
        [dispatch]
    );

    return {
        ...pos,
        sucursalId,
        cajas,
        cajaAbierta,
        cajaSeleccionadaId,
        corteCaja,
        cajaLoading,
        cajaError,
        cargarProductos,
        cargarOrdenes,
        cargarContextoCaja,
        crearOrden,
        actualizarEstadoOrden,
        cobrarOrden,
        limpiarError: () => dispatch(limpiarErrorPos()),
    };
};
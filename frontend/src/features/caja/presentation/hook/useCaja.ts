import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { crearCajaThunk } from "../../aplication/usecase/CrearCaja.thunk";
import { seleccionarCaja, limpiarCajaSeleccionada } from "../../store/CajaSlice";
import { findCajasBySucursalIdThunk } from "../../aplication/query/FindCajasBySucursalId.thunk";

const useCaja = () => {
        const dispatch = useDispatch<AppDispatch>();
    const { cajas, cajaSeleccionadaId, loading, error } = useSelector(
        (state: RootState) => state.caja
    );

    const cajaActual = cajas.find((c) => c.id === cajaSeleccionadaId) ?? null;

    const crearCaja = (nuevaCaja: any) => {
        dispatch(crearCajaThunk(nuevaCaja));
    };

    const findCajasBySucursalId = (sucursalId: number) => {
        dispatch(findCajasBySucursalIdThunk(sucursalId));
    };

    const handleSeleccionarCaja = (id: number) => {
        dispatch(seleccionarCaja(id));
    };
    
    const handleLimpiarCajaSeleccionada = () => {
        dispatch(limpiarCajaSeleccionada());
    };

    return {
        cajas,
        cajaSeleccionadaId,
        cajaActual,
        loading,
        error,
        crearCaja,
        findCajasBySucursalId,
        handleSeleccionarCaja,
        handleLimpiarCajaSeleccionada,
    };


};

export default useCaja;

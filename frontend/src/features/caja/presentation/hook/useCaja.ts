import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { findCajasBySucursalIdThunk } from "../../aplication/query/FindCajasBySucursalId.thunk";
import { findCorteCajaByCajaIdThunk } from "../../aplication/query/FindCorteCajaByCajaId.thunk";
import { AbrirCajaThunk } from "../../aplication/usecase/AbrirCaja.thunk";
import { CerrarCajaThunk } from "../../aplication/usecase/CerrarCaja.thunk";
import { crearCajaThunk } from "../../aplication/usecase/CrearCaja.thunk";
import { DesactivarCajaThunk } from "../../aplication/usecase/DesactivarCaja.thunk";
import { CajaDto } from "../../domain/Caja.types";
import { limpiarCajaSeleccionada, seleccionarCaja } from "../../store/CajaSlice";

const useCaja = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { cajas, cajaSeleccionadaId, loading, error,corteCaja } = useSelector(
        (state: RootState) => state.caja
    );

    const sucursalIdActual = useSelector(
        (state: RootState) => state.sucursal.sucursalSeleccionadaId
    );

    const cajaActual = cajas.find((c) => c.id === cajaSeleccionadaId) ?? null;

    const crearCaja = (nuevaCaja: CajaDto) => {
        dispatch(crearCajaThunk({ sucursalId: sucursalIdActual!, cajaDto: nuevaCaja }));
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

    const abrirCaja = () => {
        dispatch(AbrirCajaThunk(cajaSeleccionadaId!));
    };

    const cerrarCaja = () => {
        dispatch(CerrarCajaThunk(cajaSeleccionadaId!));
    };

    const findCorteCajaActualByCajaId = (cajaId: number) => {
        dispatch(findCorteCajaByCajaIdThunk(cajaId));
    }

    const desactivarCaja = async (cajaId: number) => {
        await dispatch(DesactivarCajaThunk(cajaId)).unwrap();
    };

    return {
        cajas,
        cajaSeleccionadaId,
        cajaActual,
        loading,
        error,
        corteCaja,
        crearCaja,
        findCajasBySucursalId,
        handleSeleccionarCaja,
        handleLimpiarCajaSeleccionada,
        abrirCaja,
        cerrarCaja,
        findCorteCajaActualByCajaId,
        desactivarCaja,
        
    };


};

export default useCaja;

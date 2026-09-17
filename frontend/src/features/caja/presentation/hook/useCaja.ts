import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { crearCajaThunk } from "../../aplication/usecase/CrearCaja.thunk";
import { seleccionarCaja, limpiarCajaSeleccionada } from "../../store/CajaSlice";
import { findCajasBySucursalIdThunk } from "../../aplication/query/FindCajasBySucursalId.thunk";
import { CerrarCajaThunk } from "../../aplication/usecase/CerrarCaja.thunk";
import { AbrirCajaThunk } from "../../aplication/usecase/AbrirCaja.thunk";
import { CajaDto } from "../../domain/Caja.types";
import { findCorteCajaByCajaIdThunk } from "../../aplication/query/FindCorteCajaByCajaId.thunk";

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
        
    };


};

export default useCaja;

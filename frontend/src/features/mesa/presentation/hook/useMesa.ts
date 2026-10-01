import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findMesasBySucursalIdThunk } from "../../aplication/query/FindMesasBySucursalIdThunk";
import { crearMesaThunk } from "../../aplication/usecase/CrearMesaThunk";
import type { MesaDto } from "../../domain/types/mesa.types";
import { limpiarErrorMesa } from "../../store/mesa.slice";

export const useMesa = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { mesas, loading, saving, error } = useSelector((state: RootState) => state.mesa);

    const mesasDisponibles = mesas.filter((mesa) => mesa.estado === "LIBRE");

    const cargarMesas = useCallback(
        (sucursalId: number) => dispatch(findMesasBySucursalIdThunk(sucursalId)),
        [dispatch]
    );

    const crearMesa = useCallback(
        (mesa: MesaDto) => dispatch(crearMesaThunk(mesa)),
        [dispatch]
    );

    return {
        mesas,
        mesasDisponibles,
        loading,
        saving,
        error,
        cargarMesas,
        crearMesa,
        limpiarError: () => dispatch(limpiarErrorMesa()),
    };
};

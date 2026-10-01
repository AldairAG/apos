import { AppDispatch, RootState } from "@/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findSucursalesByEmpresaThunk } from "../../aplication/query/FindSucursalesByEmpresaThunk";
import { crearSucursalThunk } from "../../aplication/usecase/CrearSucursalThunk";
import { desactivarSucursalThunk } from "../../aplication/usecase/DesactivarSucursalThunk";
import { SucursalDto } from "../../domain/types/sucursal.types";
import { seleccionarSucursal } from "../../store/sucursal.slice";

export const useSucursal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { sucursales, sucursalSeleccionadaId, loading, error } = useSelector(
        (state: RootState) => state.sucursal
    );

    const sucursalActual = sucursales.find((s) => s.id === sucursalSeleccionadaId) ?? null;

    const cambiarSucursal = (id: number) => {
        dispatch(seleccionarSucursal(id));
    };

    const crearSucursal = (sucursal: SucursalDto) => {
        dispatch(crearSucursalThunk(sucursal));
    };

    const findSucursalesByEmpresa = useCallback(() => {
        dispatch(findSucursalesByEmpresaThunk());
    }, [dispatch]);

    const desactivarSucursal = async (id: number) => {
        await dispatch(desactivarSucursalThunk(id)).unwrap();
    };

    return {
        sucursales,
        sucursalActual,
        sucursalSeleccionadaId,
        loading,
        error,
        cambiarSucursal,
        crearSucursal,
        findSucursalesByEmpresa,
        desactivarSucursal,
    };
};

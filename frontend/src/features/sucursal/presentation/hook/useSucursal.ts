import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { seleccionarSucursal } from "../../store/sucursal.slice";
import { crearSucursalThunk } from "../../aplication/usecase/CrearSucursalThunk";
import { SucursalDto } from "../../domain/types/sucursal.types";
import { findSucursalesByEmpresaThunk } from "../../aplication/query/FindSucursalesByEmpresaThunk";

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

    const findSucursalesByEmpresa = () => {
        dispatch(findSucursalesByEmpresaThunk());
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
    };
};

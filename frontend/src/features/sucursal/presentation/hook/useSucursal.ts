import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { seleccionarSucursal } from "../../store/sucursal.slice";

// Hook para leer y sincronizar la sucursal seleccionada (Redux) desde cualquier pantalla del contexto de sucursal.
export const useSucursal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { sucursales, sucursalSeleccionadaId, loading, error } = useSelector(
        (state: RootState) => state.sucursal
    );

    const sucursalActual = sucursales.find((s) => s.id === sucursalSeleccionadaId) ?? null;

    const cambiarSucursal = (id: string) => {
        dispatch(seleccionarSucursal(id));
    };

    return {
        sucursales,
        sucursalActual,
        sucursalSeleccionadaId,
        loading,
        error,
        cambiarSucursal,
    };
};

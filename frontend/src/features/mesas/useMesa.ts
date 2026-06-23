import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchMesasBySucursalId } from "./mesa.thunk";

export const useMesa = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { mesas, selectedMesa, loading, error } = useSelector(
        (state: RootState) => state.mesas
    );

    // Cargar todas las mesas por ID de sucursal
    const cargarMesasBySucursalId = (sucursalId: number) => {
        dispatch(fetchMesasBySucursalId(sucursalId));
    };
    
    return {
        mesas,
        selectedMesa,
        loading,
        error,
        cargarMesasBySucursalId,
    };
};
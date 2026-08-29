import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { crearEmpresaThunk } from "../../aplication/usecase/crearEmpresa.thunk";
import { EmpresaDto } from "../../domain/types/empresa.types";

export const useEmpresa = () => {
    const dispatch = useDispatch<AppDispatch>();

    const crearEmpresa = async (empresa: EmpresaDto) => {
        const result = await dispatch(crearEmpresaThunk(empresa)).unwrap();
        return result;
    };

    return {
        crearEmpresa,
    };
};
    
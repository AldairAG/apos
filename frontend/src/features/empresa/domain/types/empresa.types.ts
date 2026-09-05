import { CuentaDto } from "../../../cuenta/domain/types/cuenta.types";

export interface EmpresaDto {
    nombre: string;
    imgUrl: string;
    imgFile?: File | null;

    cuentas?: CuentaDto[] | null;

}

export const API_BASE_PATH = "/empresas";

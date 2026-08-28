import { EmpresaDto } from "@/features/empresa/domain/types/empresa.types";

export interface UsuarioDto {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    lada: string;
    empresa: EmpresaDto;
}

export enum Rol {
    ADMIN = 'ADMIN',
    USUARIO = 'USUARIO'
}

export const API_BASE_PATH = "/usuarios";
import { Usuario } from "../../../usuario/domain/types/usuario.types";

export interface RegistroRequestDTO {
    password: string;
    email: string;
}

export interface AuthRequest {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono: string;
    lada: string;
    ultimoAcceso: Date;
    updatedAt: Date;
    rol: string;
}


// Response types
export interface JwtResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    user: Usuario;
    usuarioEnRed: number;
}

export interface JwtPayload {
    sub: string;
    rol?: string;
    exp: number;
    iat: number;
}

export enum Rol {
    ADMINISTRADOR = 'ADMINISTRADOR',
    GERENTE = 'GERENTE',
    MESERO = 'MESERO',
    COCINA = 'COCINA',
    SIN_ROL = 'SIN_ROL'
}


export const BASE_PATH = '/usuarios';

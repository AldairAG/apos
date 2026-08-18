import { Usuario } from "../../../usuario/domain/types/usuario.types";

export interface RegistroRequestDTO {
    username: string;
    password: string;
    email: string;
    referenciado: string;
    telefono: string;
}

export interface AuthRequest {
    email: string;
    password: string;
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

export const BASE_PATH = '/usuarios';

export interface RegistroRequestDTO {
    username: string;
    password: string;
    email: string;
    referenciado: string;
    telefono: string;
}

export interface LoginRequestDTO {
    username: string;
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
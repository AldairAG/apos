export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    password: string;
    telefono: string;
    activo: boolean;
    fechaRegistro: Date;
    ultimoAcceso: Date;
    createdAt: Date;
    updatedAt: Date;
    rol: Rol;
    /*materiales: Material[];
    recetas: Receta[];
    sucursales: Sucursal[];
    categorias: Categoria[];
    gruposExtra: GrupoExtra[];*/

}

export enum Rol {
    ADMIN = 'ADMIN',
    USUARIO = 'USUARIO'
}
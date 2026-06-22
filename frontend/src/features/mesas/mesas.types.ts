export interface Mesa {
    id: number;
    nombre: string;
    codigo: string;
    estado: EstadoMesa;
    activa: boolean;
    ordenActual: number;
}

export enum EstadoMesa {
    LIBRE,
    OCUPADA,
    RESERVADA
}

export interface CrearMesaDTO {
    nombre: string;
    codigo: string;
}

export interface MesaResponse extends Mesa {
    
} 
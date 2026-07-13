export interface Mesa {
    id: number;
    nombre: string;
    codigo: string;
    estado: EstadoMesa;
    activa: boolean;
    ordenActual: number;
}

export enum EstadoMesa {
    LIBRE="LIBRE",
    OCUPADA="OCUPADA",
    RESERVADA="RESERVADA"
}

export interface CrearMesaDTO {
    nombre: string;
    codigo: string;
}

export interface MesaResponse extends Mesa {
    
}

export interface MesaState {
    mesas: Mesa[];
    selectedMesa: Mesa | null;
    loading: boolean;
    error: string | null;
}
 
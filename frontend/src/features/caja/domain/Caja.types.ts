import { MovimientoDto } from "@/features/movimiento/domain/types/Movimiento.types";
import { EstadoCaja } from "../enum/Caja.Enums";

export interface CajaDto {
    
    id: number;
    nombre: string;
    saldo: number;
    saldoInicial: number;

}


export interface CorteCajaDto {

    id: number;

    saldoInicial: number;

    saldoFinal: number;

    ingresos: number;

    egresos: number;

    gastos: number;

    ventas: number;

    estado: EstadoCaja;

    movimientos: MovimientoDto[];

    cerradoAt: Date;

    // Auditable fields
    updatedAt: Date;

    createdAt: Date;

    fecha: Date;

}

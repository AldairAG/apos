
import { MovimientoDto } from "@/features/movimiento/domain/types/Movimiento.types";
import { TipoCuenta } from "../enum/TipoCuenta";

export interface CuentaDto {
    id: number;

    nombre: string;

    saldo: number;

    tipo: TipoCuenta;

    updatedAt: Date;

    createdAt: Date;

    movimientos?: MovimientoDto[] | null;
}

import type { MetodoPago } from "@/features/pos/domain/types/pos.types";
import { CategoriaMovimiento } from "../enum/CategoriaMovimiento";
import { EstadoMovimiento } from "../enum/EstadoMovimiento";
import { TipoMovimiento } from "../enum/TipoMovimiento";

export interface MovimientoDto {
    id: number;

    descripcion: string;

    monto: number;

    tipo: TipoMovimiento;

    estado: EstadoMovimiento;

    categoria: CategoriaMovimiento;

    createdBy: number;

    updatedAt: Date;

    createdAt: Date;

    //Metodos de formulario
    cuentaId?: number | null;

    cajaId?: number | null;

    corteCajaId?: number | null;

    metodoDePago?: MetodoPago;

    materialId?: number;

    cantidadCompra?: number;

    sucursalId?: number;

    fecha?: string | Date;
}


export interface RegistrarCompraDto extends Pick<
    MovimientoDto,
    | "descripcion"
    | "monto"
    | "categoria"
> {
    fecha: string;
    cuentaId: number | null;
    cajaId: number | null;
    metodoDePago?: MetodoPago;
    materialId: number;
    cantidadCompra: number;
    sucursalId: number;
}
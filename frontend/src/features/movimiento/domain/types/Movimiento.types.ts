import { TipoMovimiento } from "../enum/TipoMovimiento";
import { EstadoMovimiento } from "../enum/EstadoMovimiento";
import { CategoriaMovimiento } from "../enum/CategoriaMovimiento";

export interface MovimientoDto {
    id: number;

    descripcion: string;

    monto: number;

    tipo: TipoMovimiento;

    estado: EstadoMovimiento;

    categoria: CategoriaMovimiento;

    createdBy: number;

    cuentaDestinoId: number;

    cuentaOrigenId: number;

    updatedAt: Date;

    createdAt: Date;

    //Metodos de formulario
    cuentaId: number;

    cajaId: number;

}
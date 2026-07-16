import { Unidad } from "@/types/globalTypes";

export interface MaterialDTO {
    id: number;
    nombre: string;
    descripcion: string;
    proveedor: string;
    categoriaInventario: string;
    unidadMedida: Unidad;
    costoUnitario: number;
    activo: boolean;
    perecedero: boolean;
    diasVencimiento: number; 
    existencia: ExistenciaDTO;
    sucursalId: number;
}


export interface ExistenciaDTO {
  id: number;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  ubicacion: string;
  lote: string;
  fechaVencimiento: string;
  alertaBajoStock: boolean;
  ultimaActualizacion: string;
}

export interface InventarioState {
  materiales: MaterialDTO[];
  materialSeleccionado: MaterialDTO | null;
  loading: boolean;
  error: string | null;
}
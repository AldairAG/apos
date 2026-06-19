import { Unidad } from "@/types/globalTypes";

export interface Material {
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
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    updatedBy: number;

/*     List<ExistenciaMaterial> existencias;
    List<DetalleReceta> detallesReceta;
    List<OpcionExtra> opcionesExtra;
    List<CompraDetalle> compraDetalles;
    List<Produccion> producciones; */
}

export interface MaterialState {
  materiales: Material[];
  materialSeleccionado: Material | null;
  loading: boolean;
  error: string | null;
}

export interface CreateMaterialDTO {
  nombre: string;
  descripcion?: string;
  proveedor?: string;
  categoriaInventario?: string;
  unidadMedida: Unidad;
  costoUnitario: number;
  activo?: boolean;
  perecedero?: boolean;
  diasVencimiento?: number;
}

export interface UpdateMaterialDTO {
  nombre?: string;
  descripcion?: string;
  proveedor?: string;
  categoriaInventario?: string;
  unidadMedida?: Unidad;
  costoUnitario?: number;
  activo?: boolean;
  perecedero?: boolean;
  diasVencimiento?: number;
}
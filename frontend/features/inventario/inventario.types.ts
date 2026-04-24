export interface AgregarItemRequest {
    // Material
    materialId: number; // Para editar, se necesita el ID del material
    nombre: string;
    descripcion: string;
    tipoMaterial: TipoMaterial;
    tipoUnidad: TipoUnidad;
    precioPorPaquete: number;
    cantidadPorPaquete: number;

    // InventarioItem
    cantidad: number;
    stockMinimo: number;
    stockMaximo: number;
    precioUnitario: number;
}

export enum TipoMaterial {
    MATERIA_PRIMA = 'MATERIA_PRIMA',
    ELABORADO = 'ELABORADO'
}

export enum TipoUnidad {
    ML = 'ML',
    GR = 'GR',
    PZ = 'PZ',
    LT = 'LT',
    OZ = 'OZ',
    KG = 'KG',
    LB = 'LB',
    UNIDAD = 'UNIDAD',
    USO = 'USO'
}


export interface Inventario {
    id: number;

    // Materiales básicos (ingredientes, insumos, etc.)
    items: InventarioItem[];

    // Productos elaborados (resultados de recetas que se almacenan)
    productosElaborados: InventarioProducto[];
}

export interface InventarioItem {
    id: number;
    material: Material;
    cantidad: number;
    stockMinimo: number;
    stockMaximo: number;
    precioUnitario: number;

    fechaUltimaActualizacion: Date;
    fechaUltimaCompra: Date;
}

export interface Material {
    id: number;
    nombre: string;
    descripcion: string;
    tipoMaterial: TipoMaterial;
    tipoUnidad: TipoUnidad;
    activo: boolean;
}

export interface InventarioProducto {
    id: number;
    inventario: Inventario;
    productoElaborado: ProductoElaborado;
    cantidad: number;
    stockMinimo: number;
    fechaUltimaActualizacion: Date;
    fechaUltimaProduccion: Date;
}

export interface ProductoElaborado {
    id: number;
    nombre: string;
    descripcion: string;
    recetaOrigen: Receta; // Receta que crea este producto
    unidadMedida: TipoUnidad; // Ej: "porciones", "kilos", "litros"
    activo: boolean;
    fechaCreacion: Date;
}

export interface Receta {
    id: number;
    nombre: string;
    descripcion: string;
    tiempoPreparacion: number; // en minutos
    porciones: number;
    precioVenta: number;
    costoTotal: number; // Calculado a partir de los ingredientes
    margenGanancia: number; // Calculado a partir del costo total y precio de venta
    gananciaNeta: number;
    activa: boolean;
    ingredientes: RecetaIngrediente[];
    tipoReceta: TipoReceta;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}

export interface RecetaIngrediente {
    id: number;
    receta: Receta;
    // OPCIÓN 1: Material básico (harina, azúcar, etc.)
    material: Material;
    // OPCIÓN 2: Producto elaborado (masa, salsa, etc.) - resultado de otra receta
    productoElaborado: ProductoElaborado;
    tipoIngrediente: TipoIngrediente;
    cantidadRequerida: number;
    notas: string; // Ej: "picado finamente", "a temperatura ambiente"
}

export enum TipoReceta {
    INTERMEDIA = 'INTERMEDIA', // Ej: "Masa de banderilla" - se usa en otras recetas
    FINAL = 'FINAL' // Ej: "Banderillas terminadas" - producto final para venta
}

export enum TipoIngrediente {
    MATERIAL = 'MATERIAL', // Ingrediente básico
    PRODUCTO_ELABORADO = 'PRODUCTO_ELABORADO' // Resultado de otra receta
}

export enum TipoMovimiento {
    // Ingresos
    VENTA= "VENTA",
    DEVOLUCION_VENTA= "DEVOLUCION_VENTA",
    INGRESO_EXTRA= "INGRESO_EXTRA",

    // Inventario
    GASTO_RESTOCK= "GASTO_RESTOCK",

    // Operación diaria
    GASTO_OPERATIVO= "GASTO_OPERATIVO",

    // Administración
    GASTO_ADMINISTRATIVO= "GASTO_ADMINISTRATIVO",

    // Nómina
    PAGO_EMPLEADO= "PAGO_EMPLEADO",

    // Servicios
    PAGO_SERVICIO= "PAGO_SERVICIO",

    // Activos
    COMPRA_ACTIVO= "COMPRA_ACTIVO",

    // Caja
    RETIRO_CAJA= "RETIRO_CAJA",
    INGRESO_CAJA= "INGRESO_CAJA"
}
package com.api.apos.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    //GENERIC
    INTERNAL_ERROR(
            "INTERNAL_ERROR",
            "Ocurrió un error interno",
            HttpStatus.INTERNAL_SERVER_ERROR
    ),  
    ERROR_ALMACENANDO_ARCHIVO(
            "ERROR_ALMACENANDO_ARCHIVO",
            "Ocurrió un error al almacenar el archivo",
            HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_ALMACENANDO_ARCHIVO_ARCHIVO_VACIO(
            "ERROR_ALMACENANDO_ARCHIVO_ARCHIVO_VACIO",
            "Ocurrió un error al almacenar el archivo porque el archivo está vacío",
            HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ARCHIVO_NO_ENCONTRADO(
            "ARCHIVO_NO_ENCONTRADO",
            "Archivo no encontrado",
            HttpStatus.NOT_FOUND
    ),

    //USUARIO
    USUARIO_YA_EXISTE(
            "USUARIO_YA_EXISTE",
            "El usuario ya existe",
            HttpStatus.CONFLICT
    ),

    USUARIO_CORREO_YA_EXISTE(
            "USUARIO_CORREO_YA_EXISTE",
            "El correo del usuario ya está registrado",
            HttpStatus.CONFLICT
    ),

    USUARIO_NO_ENCONTRADO(
            "USUARIO_NO_ENCONTRADO",
            "El usuario no fue encontrado",
            HttpStatus.NOT_FOUND
    ),

    CREDENCIALES_INVALIDAS(
            "CREDENCIALES_INVALIDAS",
            "Las credenciales son incorrectas",
            HttpStatus.UNAUTHORIZED
    ),
    EMAIL_Y_PASSWORD_REQUERIDOS(
            "EMAIL_Y_PASSWORD_REQUERIDOS",
            "Email y password son requeridos",
            HttpStatus.BAD_REQUEST
    ),
    
    //EMPRESA
    EMPRESA_NO_ENCONTRADA(
        "EMPRESA_NO_ENCONTRADA",
        "Empresa no encontrada",
        HttpStatus.NOT_FOUND
    ),
    EMPRESA_DESACTIVADA(
        "EMPRESA_DESACTIVADA",
        "La empresa está desactivada",
        HttpStatus.FORBIDDEN
    ),
    SUCURSAL_NO_ENCONTRADA(
        "SUCURSAL_NO_ENCONTRADA",
        "Sucursal no encontrada",
        HttpStatus.NOT_FOUND
    ),
    //CUENTA
    CUENTA_NO_ENCONTRADA(
        "CUENTA_NO_ENCONTRADA",
        "Cuenta no encontrada",
        HttpStatus.NOT_FOUND
    ),
    //MOVIMIENTO
    MOVIMIENTO_NO_ENCONTRADO(
        "MOVIMIENTO_NO_ENCONTRADO",
        "Movimiento no encontrado",
        HttpStatus.NOT_FOUND
    ),

    MOVIMIENTO_NO_PERMITIDO(
        "MOVIMIENTO_NO_PERMITIDO",
        "El movimiento no está permitido",
        HttpStatus.FORBIDDEN
    ),
    RECURSO_NO_AUTORIZADO(
        "RECURSO_NO_AUTORIZADO",
        "No tienes permiso para modificar este recurso",
        HttpStatus.FORBIDDEN
    ),

    MOVIMIENTOS_NO_ENCONTRADOS(
        "MOVIMIENTOS_NO_ENCONTRADOS",
        "No se encontraron movimientos",
        HttpStatus.NOT_FOUND
    ),

    //CAJA
    CAJA_NO_ENCONTRADA(
        "CAJA_NO_ENCONTRADA",
        "Caja no encontrada",
        HttpStatus.NOT_FOUND
    ),
    CAJA_ABIERTA_NO_ELIMINABLE(
        "CAJA_ABIERTA_NO_ELIMINABLE",
        "Cierra la caja antes de desactivarla",
        HttpStatus.BAD_REQUEST
    ),

    ERROR_AL_GUARDAR_CAJA(
        "ERROR_AL_GUARDAR_CAJA",
        "Ocurrió un error al guardar la caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    ERROR_AL_ELIMINAR_CAJA(
        "ERROR_AL_ELIMINAR_CAJA",
        "Ocurrió un error al eliminar la caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    ERROR_AL_ABRIR_CAJA(
        "ERROR_AL_ABRIR_CAJA",
        "Ocurrió un error al abrir la caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    ERROR_AL_CERRAR_CAJA(
        "ERROR_AL_CERRAR_CAJA",
        "Ocurrió un error al cerrar la caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    //CORTE_CAJA
    CORTE_CAJA_NO_ENCONTRADO(
        "CORTE_CAJA_NO_ENCONTRADO",
        "Corte de caja no encontrado",
        HttpStatus.NOT_FOUND
    ),
    ERROR_AL_GUARDAR_CORTE_CAJA(
        "ERROR_AL_GUARDAR_CORTE_CAJA",
        "Ocurrió un error al guardar el corte de caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ELIMINAR_CORTE_CAJA(
        "ERROR_AL_ELIMINAR_CORTE_CAJA",
        "Ocurrió un error al eliminar el corte de caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ABRIR_CORTE_CAJA(
        "ERROR_AL_ABRIR_CORTE_CAJA",
        "Ocurrió un error al abrir el corte de caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_CERRAR_CORTE_CAJA(
        "ERROR_AL_CERRAR_CORTE_CAJA",
        "Ocurrió un error al cerrar el corte de caja",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_CORTE_NO_ABIERTO(
        "ERROR_CORTE_NO_ABIERTO",
        "El corte de caja no está abierto",
        HttpStatus.BAD_REQUEST
    ),

    //PRODUCTO
    PRODUCTO_NO_ENCONTRADO(
        "PRODUCTO_NO_ENCONTRADO",
        "Producto no encontrado",
        HttpStatus.NOT_FOUND
    ),
    ERROR_AL_GUARDAR_PRODUCTO(
        "ERROR_AL_GUARDAR_PRODUCTO",
        "Ocurrió un error al guardar el producto",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ELIMINAR_PRODUCTO(
        "ERROR_AL_ELIMINAR_PRODUCTO",
        "Ocurrió un error al eliminar el producto",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    //MODIFICADOR
    MODIFICADOR_NO_ENCONTRADO(
        "MODIFICADOR_NO_ENCONTRADO",
        "Modificador no encontrado",
        HttpStatus.NOT_FOUND
    ),
    ERROR_AL_GUARDAR_MODIFICADOR(
        "ERROR_AL_GUARDAR_MODIFICADOR",
        "Ocurrió un error al guardar el modificador",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ELIMINAR_MODIFICADOR(
        "ERROR_AL_ELIMINAR_MODIFICADOR",
        "Ocurrió un error al eliminar el modificador",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ACTUALIZAR_MODIFICADOR(
        "ERROR_AL_ACTUALIZAR_MODIFICADOR",
        "Ocurrió un error al actualizar el modificador",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    //EXISTENCIA
    EXISTENCIA_NO_ENCONTRADA(
        "EXISTENCIA_NO_ENCONTRADA",
        "Existencia no encontrada",
        HttpStatus.NOT_FOUND
    ),
    EXISTENCIA_INSUFICIENTE(
        "EXISTENCIA_INSUFICIENTE",
        "Existencia insuficiente",
        HttpStatus.BAD_REQUEST
    ),
    CANTIDAD_INVALIDA(
        "CANTIDAD_INVALIDA",
        "La cantidad debe ser mayor que cero",
        HttpStatus.BAD_REQUEST
    ),
    MATERIAL_NO_ENCONTRADO(
        "MATERIAL_NO_ENCONTRADO",
        "Material no encontrado",
        HttpStatus.NOT_FOUND
    ),
    RECETA_NO_ENCONTRADA(
        "RECETA_NO_ENCONTRADA",
        "Receta no encontrada",
        HttpStatus.NOT_FOUND
    ),
    RECETA_RESULTADO_INVALIDO(
        "RECETA_RESULTADO_INVALIDO",
        "El resultado de la receta no coincide con la operación solicitada",
        HttpStatus.BAD_REQUEST
    ),
    ERROR_AL_DESCONTAR_EXISTENCIA(
        "ERROR_AL_DESCONTAR_EXISTENCIA",
        "Ocurrió un error al descontar la existencia",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ACTUALIZAR_EXISTENCIA(
        "ERROR_AL_ACTUALIZAR_EXISTENCIA",
        "Ocurrió un error al actualizar la existencia",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    //ORDEN
    ORDEN_NO_ENCONTRADA(
        "ORDEN_NO_ENCONTRADA",
        "Orden no encontrada",
        HttpStatus.NOT_FOUND
    ),
    ERROR_AL_GUARDAR_ORDEN(
        "ERROR_AL_GUARDAR_ORDEN",
        "Ocurrió un error al guardar la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ELIMINAR_ORDEN(
        "ERROR_AL_ELIMINAR_ORDEN",
        "Ocurrió un error al eliminar la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    ERROR_AL_ACTUALIZAR_ORDEN(
        "ERROR_AL_ACTUALIZAR_ORDEN",
        "Ocurrió un error al actualizar la orden",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),

    //MESA
    MESA_NO_LIBRE(
        "MESA_NO_LIBRE",
        "La mesa no está libre",
        HttpStatus.BAD_REQUEST
    ),
    MESA_NO_ENCONTRADA(
        "MESA_NO_ENCONTRADA",
        "La mesa no fue encontrada",
        HttpStatus.NOT_FOUND
    ),
    MESA_ASIGNACION_ERROR(
        "MESA_ASIGNACION_ERROR",
        "Ocurrió un error al asignar la orden a la mesa",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    MESA_LIBERACION_ERROR(
        "MESA_LIBERACION_ERROR",
        "Ocurrió un error al liberar la mesa",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    MESA_ACTUALIZACION_ERROR(
        "MESA_ACTUALIZACION_ERROR",
        "Ocurrió un error al actualizar la mesa",
        HttpStatus.INTERNAL_SERVER_ERROR
    ),
    
    //VALIDACIONES
    

    
    ;







    private final String code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
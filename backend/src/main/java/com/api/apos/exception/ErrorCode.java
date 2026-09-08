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
    );







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
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
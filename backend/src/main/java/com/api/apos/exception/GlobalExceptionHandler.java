package com.api.apos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.api.apos.helpers.ApiResponseWrapper;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponseWrapper<Void>> handleAppException(
            AppException ex) {

        ErrorCode errorCode = ex.getErrorCode();

        ApiResponseWrapper<Void> response = new ApiResponseWrapper<>( false, null, errorCode.getMessage(), errorCode.getCode());

        response.setSuccess(false);
        response.setData(null);
        response.setMessage(errorCode.getMessage());
        response.setCodeError(errorCode.getCode());

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }


    // Errores inesperados del backend
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseWrapper<Void>> handleException(
            Exception ex) {

        ApiResponseWrapper<Void> response =
                new ApiResponseWrapper<>(
                        false,
                        null,
                        "Ocurrió un error interno",
                        ErrorCode.INTERNAL_ERROR.getCode()
                );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
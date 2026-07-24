package com.api.apos.dto.request;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String nombre;
    private String apellido;
    private String telefono;
    private String lada;
}

package com.api.apos.dto.request;

import java.time.LocalDateTime;

import com.api.apos.enums.Rol;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String nombre;
    private String apellido;
    private String telefono;
    private String lada;
    private LocalDateTime ultimoAcceso;
    private LocalDateTime updatedAt;
    private Rol rol;
}

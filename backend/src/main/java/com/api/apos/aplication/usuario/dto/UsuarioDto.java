package com.api.apos.aplication.usuario.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioDto {
    private String email;
    private String nombre;
    private String apellido;
    private String telefono;
    private String lada;
}

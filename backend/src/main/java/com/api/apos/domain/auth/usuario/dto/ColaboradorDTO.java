package com.api.apos.domain.auth.usuario.dto;

import com.api.apos.enums.Rol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ColaboradorDTO {
    private Long id;
    private String email;
    private String password;
    private Rol rol;
    private String nombre;
    private String telefono;
}

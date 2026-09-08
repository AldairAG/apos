package com.api.apos.aplication.usuario.dto;

import com.api.apos.aplication.empresa.dto.EmpresaDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioDto {
    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private String telefono;
    private String lada;

    private EmpresaDto empresa;
}

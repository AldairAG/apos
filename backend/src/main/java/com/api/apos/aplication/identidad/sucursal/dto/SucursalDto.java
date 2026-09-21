package com.api.apos.aplication.identidad.sucursal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor 
public class SucursalDto {
    private Long id;

    private String nombre;

    private String codigo;

    private String direccion;

    private String telefono;
}

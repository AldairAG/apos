package com.api.apos.aplication.sucursal.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SucursalDto {
    private Long id;

    private String nombre;

    private String codigo;

    private Boolean activa;

    private String direccion;

    private String telefono;
}

package com.api.apos.domain.caja.caja.dto;

import lombok.Data;

@Data
public class CrearCajaRequest {
    private String nombre;
    private Boolean activa;
    private Long sucursalId;
}

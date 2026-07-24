package com.api.apos.domain.caja.caja.dto;

import com.api.apos.enums.EstadoCaja;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CajaDTO {
    private Long id;
    private String nombre;
    private Boolean activa;
    private EstadoCaja estado;
    
}

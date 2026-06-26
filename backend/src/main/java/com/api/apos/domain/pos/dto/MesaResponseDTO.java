package com.api.apos.domain.pos.dto;

import com.api.apos.enums.EstadoMesa;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;


@Data
public class MesaResponseDTO {

    private Long id;
    
    private String nombre;
    private String codigo;
    
    @Enumerated(EnumType.STRING)
    private EstadoMesa estado;
    
    private Boolean activa;
    private Long ordenActual;
    
    private OrdenResponseDTO ordenActualDTO;
}

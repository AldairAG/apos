package com.api.apos.aplication.receta.dto;

import java.math.BigDecimal;

import com.api.apos.enums.UnidadMedida;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class RecetaDetallesDto {
    
     private Long id;

    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    private UnidadMedida unidadMedida;

    private BigDecimal costo;
    
    private String nombreMaterial;

    private Long materialId;


}

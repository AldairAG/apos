package com.api.apos.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitar la elaboración de una receta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElaborarRecetaRequest {
    
    private Long recetaId;
    private Long sucursalId;
    private Integer cantidad; // Número de porciones a producir
    private String observaciones;
}

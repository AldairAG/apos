package com.api.apos.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el stock de inventario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarInventarioRequest {
    
    private Long materialId;
    private BigDecimal cantidad;
    private String operacion; // "AGREGAR" o "AJUSTAR"
    private BigDecimal precioUnitario;
}

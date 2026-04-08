package com.api.apos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para items de inventario con información resumida
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventarioItemDTO {
    
    private Long id;
    private Long materialId;
    private String materialNombre;
    private String tipoUnidad;
    private BigDecimal cantidad;
    private BigDecimal stockMinimo;
    private BigDecimal stockMaximo;
    private BigDecimal precioUnitario;
    private LocalDateTime fechaUltimaActualizacion;
    private Boolean stockBajo; // Indica si está por debajo del stock mínimo
}

package com.api.apos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para productos elaborados en inventario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventarioProductoDTO {
    
    private Long id;
    private Long productoElaboradoId;
    private String productoNombre;
    private String unidadMedida;
    private BigDecimal cantidad;
    private BigDecimal stockMinimo;
    private LocalDateTime fechaUltimaProduccion;
    private Boolean stockBajo; // Indica si está por debajo del stock mínimo
}

package com.api.apos.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transferir datos de Material sin exponer detalles internos de la entidad
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterialDTO {
    
    private Long id;
    private String nombre;
    private String descripcion;
    private String tipoMaterial;
    private String tipoUnidad;
    private Boolean activo;
}

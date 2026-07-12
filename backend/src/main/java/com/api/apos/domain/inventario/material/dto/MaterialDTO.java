package com.api.apos.domain.inventario.material.dto;

import java.time.LocalDateTime;

import com.api.apos.enums.Unidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaterialDTO {
    private Long id;

    private String nombre;
    private String descripcion;
    private String proveedor;
    private String categoriaInventario;

    private Unidad unidadMedida;
    
    private java.math.BigDecimal costoUnitario;
    private Boolean activo;
    private Boolean perecedero;
    private Integer diasVencimiento;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}

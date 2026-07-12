package com.api.apos.features.inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.api.apos.enums.Unidad;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MaterialDTO {
    private Long id;

    private String nombre;
    private String descripcion;
    private String proveedor;
    private String categoriaInventario;

    @Enumerated(EnumType.STRING)
    private Unidad unidadMedida;
    
    private BigDecimal costoUnitario;
    private Boolean activo;
    private Boolean perecedero;
    private Integer diasVencimiento; 

    private ExistenciaDTO existencia;

    private Long sucursalId;

    @Data
    @Builder
    public static class ExistenciaDTO {
        private Long id;
        private BigDecimal stockActual;
        private BigDecimal stockMinimo;
        private BigDecimal stockMaximo;
        private String ubicacion;
        private String lote;
        private LocalDate fechaVencimiento;
        private Boolean alertaBajoStock;
        private LocalDateTime ultimaActualizacion;
    }
}

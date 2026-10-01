package com.api.apos.aplication.inventario.existencia.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.enums.ConceptoMovimientoInventario;
import com.api.apos.enums.TipoMovimientoInventario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MovimientoInventarioDto {

    private Long id;
    private Long materialId;
    private String materialNombre;
    private Long sucursalId;
    private String sucursalNombre;
    private BigDecimal cantidad;
    private TipoMovimientoInventario tipoMovimiento;
    private ConceptoMovimientoInventario conceptoMovimiento;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fecha;
}
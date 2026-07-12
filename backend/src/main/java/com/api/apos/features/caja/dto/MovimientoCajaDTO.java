package com.api.apos.features.caja.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoConceptoMovimiento;
import com.api.apos.enums.TipoMovimientoCaja;

import lombok.Data;

@Data
public class MovimientoCajaDTO {
    private Long id;
    private TipoMovimientoCaja tipoMovimiento;
    private TipoConceptoMovimiento conceptoMovimiento;
    private MetodoPago metodoPago;
    private String concepto;
    private String referencia;
    private BigDecimal monto;
    private Boolean aprobado;
    private LocalDateTime fecha;
    private LocalDateTime createdAt;
    private Long createdBy;
    private Long cajaId;
    private Long empleadoId;
    private Long ordenId;

}
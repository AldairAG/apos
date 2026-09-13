package com.api.apos.aplication.caja.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.enums.EstadoCaja;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CorteCajaDto {

    private Long id;

    private BigDecimal saldoInicial;

    private BigDecimal saldoFinal;

    private BigDecimal ingresos;

    private BigDecimal egresos;

    private BigDecimal gastos;

    private BigDecimal ventas;

    private EstadoCaja estado;

    private List<MovimientoDto> movimientos;

    private LocalDateTime cerradoAt;

    // Auditable fields
    private LocalDateTime updatedAt;

    private LocalDateTime createdAt;

    private LocalDateTime fecha;

}

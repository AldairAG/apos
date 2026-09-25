package com.api.apos.aplication.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.enums.EstadoOrden;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class OrdenDto {

    private Long id;

    private EstadoOrden estado;

    private BigDecimal subtotal;

    private BigDecimal descuento;

    private BigDecimal total;

    private LocalDateTime createdAt;

    private Long sucursalId;

    private Long mesaId;

    private String mesaNombre;

    private Long ventaId;

    private List<DetalleOrdenDto> detalles;

}

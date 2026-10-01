package com.api.apos.aplication.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor 
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

    private TipoOrden tipo;

    private List<DetalleOrdenDto> detalles;

}

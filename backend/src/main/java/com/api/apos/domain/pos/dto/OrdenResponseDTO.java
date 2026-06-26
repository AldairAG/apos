package com.api.apos.domain.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.mesa.Mesa;
import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;

import lombok.Data;

@Data
public class OrdenResponseDTO {
        
    private Long id;
    private String folio;
    private TipoOrden tipo;
    private EstadoOrden estado;
    
    private Integer numeroPersonas;
    private Integer tiempoPreparacion;
    
    private String observaciones;
    
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal propina;
    private BigDecimal total;
    
    private LocalDateTime fecha;
    private LocalDateTime horaEntrega;
    private LocalDateTime createdAt;

    private Mesa mesa;

    private List<DetalleOrden> detalles;
    
}

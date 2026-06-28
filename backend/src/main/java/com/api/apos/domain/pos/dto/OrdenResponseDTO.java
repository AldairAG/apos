package com.api.apos.domain.pos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.mesa.Mesa;
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
    private Long mesaId;

    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal propina;
    private BigDecimal total;

    private LocalDateTime fecha;
    private LocalDateTime horaEntrega;
    private LocalDateTime createdAt;

    private Mesa mesa;

    private List<DetalleOrdenResponseDTO> detalles;

    @Data
    public static class DetalleOrdenResponseDTO {
        private Long id;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal total;
        private List<DetalleOrdenExtraResponseDTO> extras;

    }

    @Data
    public static class DetalleOrdenExtraResponseDTO {
        private Long id;
        private String nombreExtra;
        private BigDecimal precioExtra;
        private Long opcionId;
        private Integer cantidad;
        private BigDecimal total;
    }
}

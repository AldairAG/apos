package com.api.apos.domain.pos.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.enums.TipoOrden;

import lombok.Data;

@Data
public class CrearOrdenDTO {
    private Long id;
    private TipoOrden tipo;
    private Integer numeroPersonas;
    private String observaciones;

    private String nombreCliente;
    private String telefonoCliente;
    
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    
    private Long sucursalId;

    private Long mesaId;

    private List<DetalleOrdenDTO> detallesDTO;

    @Data
    public static class DetalleOrdenDTO {
        private Long productoId;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
        private List<DetalleOrdenExtraDTO> extras;
    }

    @Data
    public static class DetalleOrdenExtraDTO {
        private Long opcionExtraId;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
    
}

package com.api.apos.features.pos.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.enums.TipoPago;

import lombok.Data;

@Data
public class PagarOrdenDTO {
    private Long ordenId;
    private Long cajaId;
    private Boolean pagoMixto;
    private List<PagoDto> pagos;

    @Data
    public static class PagoDto {
        private TipoPago metodoPago;
        private BigDecimal monto;
    } 
}

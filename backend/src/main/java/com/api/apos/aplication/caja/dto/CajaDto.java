package com.api.apos.aplication.caja.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data 
public class CajaDto {
    
    private Long id;
    private String nombre;
    private BigDecimal saldo;
    private BigDecimal saldoInicial;

}

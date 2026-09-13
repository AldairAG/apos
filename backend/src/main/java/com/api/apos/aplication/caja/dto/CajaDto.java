package com.api.apos.aplication.caja.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

@Data 
@Builder    
@AllArgsConstructor
@NoArgsConstructor  
public class CajaDto {
    
    private Long id;
    private String nombre;
    private BigDecimal saldo;
    private BigDecimal saldoInicial;

    private CorteCajaDto corteCaja;

}

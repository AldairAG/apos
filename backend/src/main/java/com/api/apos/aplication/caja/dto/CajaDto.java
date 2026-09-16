package com.api.apos.aplication.caja.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

import com.api.apos.enums.EstadoCaja;

@Data 
@Builder    
@AllArgsConstructor
@NoArgsConstructor  
public class CajaDto {
    
    private Long id;
    private String nombre;
    private BigDecimal saldo;
    private BigDecimal saldoInicial;
    private EstadoCaja estado;
    private Long corteCajaId;

    private CorteCajaDto corteCaja;

}

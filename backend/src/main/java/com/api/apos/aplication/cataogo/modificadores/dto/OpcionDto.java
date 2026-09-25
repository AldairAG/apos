package com.api.apos.aplication.cataogo.modificadores.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor 
@Data 
@Builder 
public class OpcionDto {
    private Long id;

    private String nombre;

    private BigDecimal precio;

    private BigDecimal costo;

    private BigDecimal maximo;

    //campos para formulario
    private Integer cantidad;
}

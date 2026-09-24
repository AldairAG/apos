package com.api.apos.aplication.inventario.receta.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
@AllArgsConstructor 
public class RecetaDto {
     private Long id;

    private String nombre;

    private Double rendimiento;

    private String notas;

    private Integer tiempoPreparacion;

    private Float porcentajeSobreCostos;

    private BigDecimal costoTotal;

    private List<String> instrucciones;

    private List<RecetaDetallesDto> recetaDetalles;

    //Campos para formularios


}

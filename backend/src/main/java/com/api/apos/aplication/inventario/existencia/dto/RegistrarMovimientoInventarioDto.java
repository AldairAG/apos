package com.api.apos.aplication.inventario.existencia.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder 
@AllArgsConstructor 
public class RegistrarMovimientoInventarioDto {

    private Long materialId;

    private Long sucursalId;

    private BigDecimal cantidad;
}
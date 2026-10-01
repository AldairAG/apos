package com.api.apos.aplication.inventario.existencia.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProducirMaterialDto {

    private Long recetaId;
    private Long sucursalId;
    private BigDecimal cantidad;
}
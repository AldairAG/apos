package com.api.apos.dto.request;

import java.math.BigDecimal;

import com.api.apos.enums.TipoIngrediente;

import lombok.Data;

@Data
public class RecetaIngredienteRequest {
    private Long materialId; // Si es un material básico
    private Long productoElaboradoId; // Si es un producto elaborado (otra receta)
    private TipoIngrediente tipoIngrediente;
    private BigDecimal cantidadRequerida;
    private String notas; // Ej: "picado finamente", "a temperatura ambiente"
}
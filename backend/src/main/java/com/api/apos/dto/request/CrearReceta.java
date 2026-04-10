package com.api.apos.dto.request;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.enums.TipoReceta;

import lombok.Data;

@Data
public class CrearReceta {
    private String nombre;
    private String descripcion;
    private Integer tiempoPreparacion; // en minutos
    private Integer porciones;
    private BigDecimal precioVenta;
    private Double costoTotal; // Calculado a partir de los ingredientes
    private Double margenGanancia; // Calculado a partir del costo total y precio de venta
    private Double gananciaNeta;
    private TipoReceta tipoReceta;

    private List<RecetaIngredienteRequest> ingredientes;
}

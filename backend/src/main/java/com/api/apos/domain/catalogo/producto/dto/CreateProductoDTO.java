package com.api.apos.domain.catalogo.producto.dto;

import java.util.List;

import lombok.Data;

@Data
public class CreateProductoDTO {
    private String nombre;
    private String descripcion;
    private Double precioVenta;
    private Double costo;
    private Double margen;
    private Integer tiempoPreparacion;
    private boolean activo;
    private boolean destacado;
    private Long categoriaId;
    private Long recetaId;
    private List<Long> gruposExtra;

    
}

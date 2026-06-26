package com.api.apos.domain.pos.dto;

import java.util.List;

import com.api.apos.domain.categoria.entity.Categoria;
import com.api.apos.domain.extra.entity.ProductoGrupoExtra;

import lombok.Data;

@Data
public class ProductosBySucursalResponse {
    private Long id;

    private String nombre;
    private String descripcion;

    private java.math.BigDecimal precioVenta;
    
    private Integer tiempoPreparacion;
    
    private Boolean activo;
    private Boolean disponible;
    private Boolean destacado;

    private Categoria categoria;

    private List<ProductoGrupoExtra> gruposExtra;
}

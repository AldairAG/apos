package com.api.apos.domain.catalogo.producto.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.catalogo.categoria.entity.Categoria;
import com.api.apos.domain.catalogo.extra.entity.ProductoGrupoExtra;
import com.api.apos.domain.catalogo.receta.entity.Receta;

import lombok.Data;

@Data
public class ProductoDTO {
    private Long id;
    private String nombre;
    private String codigo;
    private String descripcion;

    private BigDecimal precioVenta;
    private BigDecimal costo;
    private BigDecimal margen;
    private Integer tiempoPreparacion;
    
    private Boolean activo;
    private Boolean disponible;
    private Boolean destacado;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    private Receta receta;
    
    private Categoria categoria;
    
    private List<ProductoGrupoExtra> gruposExtra;
}

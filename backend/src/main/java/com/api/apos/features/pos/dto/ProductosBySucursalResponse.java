package com.api.apos.features.pos.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.catalogo.categoria.entity.Categoria;
import com.api.apos.domain.catalogo.extra.dto.GrupoExtraDTO.ProductoGrupoExtraResponse;

import lombok.Data;

@Data
public class ProductosBySucursalResponse {
    private Long id;

    private String nombre;
    private String descripcion;

    private BigDecimal precioVenta;

    private Integer tiempoPreparacion;

    private Boolean activo;
    private Boolean disponible;
    private Boolean destacado;

    private Categoria categoria;

    private List<ProductoGrupoExtraResponse> gruposExtra;

    
}

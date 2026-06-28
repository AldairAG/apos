package com.api.apos.domain.pos.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.categoria.entity.Categoria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private List<ProductoGrupoExtraResponse> gruposExtra;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoGrupoExtraResponse {
        private Long id;
        private Integer minimo;
        private Integer maximo;
        private Boolean obligatorio;

        private GrupoExtraResponse grupoExtra;

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrupoExtraResponse {
        private Long id;
        private String nombre;
        private String descripcion;
        private Boolean activo;

        private List<OpcionExtraResponse> opciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpcionExtraResponse {
        private Long id;
        private String nombre;
        private BigDecimal precio;
        private Boolean activo;

    }
}

package com.api.apos.domain.catalogo.extra.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class GrupoExtraDTO {
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

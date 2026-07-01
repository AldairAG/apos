package com.api.apos.domain.catalogo.extra.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class CreateGrupoExtraDTO {
    String nombre;
    String descripcion;
    List<CreateOpcionExtraDTO> opciones;
    List<Long> productosIds;

    @Data
    public static class CreateOpcionExtraDTO {
        String nombre;
        BigDecimal precio;
        Long materialId;
    }
}
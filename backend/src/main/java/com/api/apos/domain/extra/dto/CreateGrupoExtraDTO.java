package com.api.apos.domain.extra.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class CreateGrupoExtraDTO {
    String nombre;
    String descripcion;
    List<CreateOpcionExtraDTO> opciones;

    @Data
    public class CreateOpcionExtraDTO {
        String nombre;
        BigDecimal precio;
        Long materialId;
    }
}
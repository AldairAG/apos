package com.api.apos.domain.catalogo.extra.mapper;

import com.api.apos.domain.catalogo.extra.dto.GrupoExtraDTO.GrupoExtraResponse;
import com.api.apos.domain.catalogo.extra.dto.GrupoExtraDTO.OpcionExtraResponse;
import com.api.apos.domain.catalogo.extra.dto.GrupoExtraDTO.ProductoGrupoExtraResponse;
import com.api.apos.domain.catalogo.extra.entity.GrupoExtra;
import com.api.apos.domain.catalogo.extra.entity.OpcionExtra;
import com.api.apos.domain.catalogo.extra.entity.ProductoGrupoExtra;

public class ExtraMapper {

    public static ProductoGrupoExtraResponse toDTO(ProductoGrupoExtra productoGrupoExtra) {
        if (productoGrupoExtra == null) {
            return null;
        }
        ProductoGrupoExtraResponse dto = new ProductoGrupoExtraResponse();
        dto.setId(productoGrupoExtra.getId());
        dto.setMinimo(productoGrupoExtra.getMinimo());
        dto.setMaximo(productoGrupoExtra.getMaximo());
        dto.setObligatorio(productoGrupoExtra.getObligatorio());
        dto.setGrupoExtra(toDTO(productoGrupoExtra.getGrupoExtra()));
        return dto;
    }
    
    public static GrupoExtraResponse toDTO(GrupoExtra grupoExtra) {
        if (grupoExtra == null) {
            return null;
        }
        GrupoExtraResponse dto = new GrupoExtraResponse();
        dto.setId(grupoExtra.getId());
        dto.setNombre(grupoExtra.getNombre());
        dto.setDescripcion(grupoExtra.getDescripcion());
        dto.setActivo(grupoExtra.getActivo());
        dto.setOpciones(grupoExtra.getOpciones().stream().map(ExtraMapper::toDTO).toList());
        return dto;
    }

    public static OpcionExtraResponse toDTO(OpcionExtra opcionExtra) {
        if (opcionExtra == null) {
            return null;
        }
        OpcionExtraResponse dto = new OpcionExtraResponse();
        dto.setId(opcionExtra.getId());
        dto.setNombre(opcionExtra.getNombre());
        dto.setPrecio(opcionExtra.getPrecio());
        dto.setActivo(opcionExtra.getActivo());
        return dto;
    }

}

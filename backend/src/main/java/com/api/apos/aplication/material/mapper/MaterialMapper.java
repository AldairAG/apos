package com.api.apos.aplication.material.mapper;

import com.api.apos.aplication.material.dto.MaterialDto;
import com.api.apos.domain.inventario.material.Material;

public class MaterialMapper {
    
    public static MaterialDto toDto(Material material) {
        if (material == null) {
            return null;
        }

        return MaterialDto.builder()
                .id(material.getId())
                .nombre(material.getNombre())
                .proveedor(material.getProveedor())
                .unidad(material.getUnidad())
                .cantidad(material.getCantidad())
                .precio(material.getPrecio())
                .descripcion(material.getDescripcion())
                .build();
    }

}

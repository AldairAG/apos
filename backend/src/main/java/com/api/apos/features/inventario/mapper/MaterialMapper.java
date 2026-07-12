package com.api.apos.features.inventario.mapper;

import java.util.List;

import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.features.inventario.dto.MaterialDTO;
import com.api.apos.features.inventario.dto.MaterialDTO.ExistenciaDTO;

public class MaterialMapper {
    
    public static MaterialDTO toDTO(Material material, Long sucursalId) {
        if (material == null) {
            return null;
        }

        List<ExistenciaMaterial> existenciaMaterial = material.getExistencias();

        ExistenciaMaterial existenciaActual = existenciaMaterial.stream()
                .filter(existencia -> existencia.getSucursal().getId().equals(sucursalId))
                .findFirst()
                .orElse(null);

        ExistenciaDTO existenciaDTO=ExistenciaDTO.builder()
                .id(existenciaActual.getId())
                .stockActual(existenciaActual.getStockActual())
                .stockMinimo(existenciaActual.getStockMinimo())
                .stockMaximo(existenciaActual.getStockMaximo())
                .ubicacion(existenciaActual.getUbicacion())
                .lote(existenciaActual.getLote())
                .fechaVencimiento(existenciaActual.getFechaVencimiento())
                .alertaBajoStock(existenciaActual.getAlertaBajoStock())
                .ultimaActualizacion(existenciaActual.getUltimaActualizacion())
                .build();

        return MaterialDTO.builder()
                .nombre(material.getNombre())
                .descripcion(material.getDescripcion())
                .proveedor(material.getProveedor())
                .categoriaInventario(material.getCategoriaInventario())
                .unidadMedida(material.getUnidadMedida())
                .costoUnitario(material.getCostoUnitario())
                .activo(material.getActivo())
                .existencia(existenciaDTO)  
                .build();
    }

    public static Material toEntity(MaterialDTO materialDTO) {
        if (materialDTO == null) {
            return null;
        }

        ExistenciaMaterial existencia = ExistenciaMaterial.builder()
                .id(materialDTO.getExistencia().getId())
                .stockActual(materialDTO.getExistencia().getStockActual())
                .stockMinimo(materialDTO.getExistencia().getStockMinimo())
                .stockMaximo(materialDTO.getExistencia().getStockMaximo())
                .ubicacion(materialDTO.getExistencia().getUbicacion())
                .lote(materialDTO.getExistencia().getLote())
                .fechaVencimiento(materialDTO.getExistencia().getFechaVencimiento())
                .alertaBajoStock(materialDTO.getExistencia().getAlertaBajoStock())
                .ultimaActualizacion(materialDTO.getExistencia().getUltimaActualizacion())
                .build();

        Material nuevoMaterial = Material.builder()
                .nombre(materialDTO.getNombre())
                .descripcion(materialDTO.getDescripcion())
                .proveedor(materialDTO.getProveedor())
                .categoriaInventario(materialDTO.getCategoriaInventario())
                .unidadMedida(materialDTO.getUnidadMedida())
                .costoUnitario(materialDTO.getCostoUnitario())
                .activo(materialDTO.getActivo())
                .build();

        nuevoMaterial.setExistencias(List.of(existencia));

        return nuevoMaterial;
    }

}

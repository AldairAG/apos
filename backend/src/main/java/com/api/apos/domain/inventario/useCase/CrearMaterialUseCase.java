package com.api.apos.domain.inventario.useCase;

import org.springframework.stereotype.Service;

import com.api.apos.domain.inventario.dto.MaterialDTO;
import com.api.apos.domain.stock.material.Material;
import com.api.apos.domain.stock.material.service.MaterialService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearMaterialUseCase {
    private final MaterialService materialService;

    public MaterialDTO crearMaterialUseCase(MaterialDTO materialDTO) {

        Material neuvoMaterial = Material.builder()
                .nombre(materialDTO.getNombre())
                .descripcion(materialDTO.getDescripcion())
                .proveedor(materialDTO.getProveedor())
                .categoriaInventario(materialDTO.getCategoriaInventario())
                .unidadMedida(materialDTO.getUnidadMedida())
                .costoUnitario(materialDTO.getCostoUnitario())
                .activo(true)
                .build();
    }
}

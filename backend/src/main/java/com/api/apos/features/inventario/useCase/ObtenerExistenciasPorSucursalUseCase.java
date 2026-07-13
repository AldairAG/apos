package com.api.apos.features.inventario.useCase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.inventario.existencias.entity.ExistenciaMaterial;
import com.api.apos.domain.inventario.existencias.service.ExistenciaService;
import com.api.apos.features.inventario.dto.MaterialDTO;
import com.api.apos.features.inventario.mapper.MaterialMapper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ObtenerExistenciasPorSucursalUseCase {

    private final ExistenciaService existenciaService;

    public List<MaterialDTO> execute(Long sucursalId) {

        List<ExistenciaMaterial> existencias = existenciaService.obtenerInventarioSucursal(sucursalId);

        List<MaterialDTO> materialesDTO = existencias.stream()
                .map(existencia -> MaterialMapper.toDTO(existencia.getMaterial(), sucursalId))
                .toList();

        return materialesDTO;
    }

}

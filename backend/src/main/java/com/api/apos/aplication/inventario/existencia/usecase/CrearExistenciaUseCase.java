package com.api.apos.aplication.inventario.existencia.usecase;

import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.existencia.mapper.ExistenciaMapper;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

public class CrearExistenciaUseCase {

    private SucursalService sucursalService;

    private MaterialService materialService;

    public ExistenciaDto execute(ExistenciaDto existenciaDto) {

        Sucursal sucursal = sucursalService.findById(existenciaDto.getSucursalId());

        Material material =materialService.findById(existenciaDto.getMaterialId());

        Existencia existencia = Existencia.builder()
                .cantidadActual(existenciaDto.getCantidadActual())
                .cantidadMinima(existenciaDto.getCantidadMinima())
                .estado(existenciaDto.getEstado())
                .material(material)
                .unidadMedida(existenciaDto.getUnidadMedida())
                .build();
        
        sucursal.addExistencia(existencia);

        return ExistenciaMapper.toDto(existencia);

    }

}

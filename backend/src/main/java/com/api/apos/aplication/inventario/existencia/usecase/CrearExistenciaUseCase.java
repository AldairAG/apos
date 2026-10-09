package com.api.apos.aplication.inventario.existencia.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaService;

import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.existencia.mapper.ExistenciaMapper;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.enums.TipoMaterial;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class CrearExistenciaUseCase {

    private SucursalService sucursalService;

    private MaterialService materialService;

    private ExistenciaService existenciaService;

    private RecetaService recetaService;

    @Transactional
    public ExistenciaDto execute(ExistenciaDto existenciaDto) {
        Sucursal sucursal = sucursalService.findById(existenciaDto.getSucursalId());

        Material material = materialService.findById(existenciaDto.getMaterialId());

        if (material.getTipoMaterial() == TipoMaterial.PRODUCTO_ELABORADO) {
            Receta receta = recetaService.findByMaterialId(material.getId());

            // Lógica para crear existencias de los materiales de la receta
            receta.getRecetaDetalles().forEach(detalle -> {
                ExistenciaDto existenciaDetalleDto = ExistenciaMapper.toDto(new Existencia().initCero());
                existenciaDetalleDto.setMaterialId(detalle.getMaterial().getId());
                existenciaDetalleDto.setSucursalId(sucursal.getId());
                crearExistenciaReceta(existenciaDetalleDto, detalle.getMaterial(), sucursal);
            });
        }

        return crearExistenciaReceta(existenciaDto, material,sucursal);

    }

    // Si el material es de tipo PRODUCTO_ELABORADO se debera buscar la receta y
    // crear existencias para los materiales de la receta
    public ExistenciaDto crearExistenciaReceta(ExistenciaDto existenciaDto, Material material, Sucursal sucursal) {
        Existencia existencia = Existencia.builder()
                .cantidadActual(existenciaDto.getCantidadActual())
                .cantidadMinima(material.getUnidad().getExistenciaMinimaDefault())
                .estado(existenciaDto.getEstado())
                .material(material)
                .unidadMedida(material.getUnidad())
                .build();

        sucursal.addExistencia(existencia);

        existenciaService.save(existencia);

        return ExistenciaMapper.toDto(existencia);
    }

}

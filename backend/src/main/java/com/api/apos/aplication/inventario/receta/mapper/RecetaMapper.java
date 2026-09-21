package com.api.apos.aplication.inventario.receta.mapper;

import java.util.List;

import com.api.apos.aplication.inventario.receta.dto.RecetaDetallesDto;
import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.domain.inventario.receta.Receta;

public class RecetaMapper {

    public static RecetaDto toDto(Receta receta) {

        List<RecetaDetallesDto> detalles=receta.getRecetaDetalles().stream()
                .map(detalle -> RecetaDetallesDto.builder()
                        .id(detalle.getId())
                        .cantidad(detalle.getCantidad())
                        .unidadMedida(detalle.getUnidadMedida())
                        .costo(detalle.getCosto())
                        .nombreMaterial(detalle.getMaterial().getNombre())
                        .build())
                .toList();

        return RecetaDto.builder()
                .id(receta.getId())
                .nombre(receta.getNombre())
                .rendimiento(receta.getRendimiento())
                .notas(receta.getNotas())
                .tiempoPreparacion(receta.getTiempoPreparacion())
                .porcentajeSobreCostos(receta.getPorcentajeSobreCostos())
                .costoTotal(receta.getCostoTotal())
                .instrucciones(receta.getInstrucciones())
                .recetaDetalles(detalles)
                .build();


    }

}

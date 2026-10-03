package com.api.apos.aplication.inventario.receta.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.aplication.inventario.receta.mapper.RecetaMapper;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.enums.TipoResultadoReceta;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UpdateRecetaUseCase {

    private final RecetaService recetaServicio;

    private final MaterialService materialService;

    //private final UsuarioService usuarioService;

    @Transactional 
    public RecetaDto execute(Long recetaId, RecetaDto recetaDto) {

        if (recetaId == null || recetaId <= 0) {
            throw new AppException(ErrorCode.RECETA_NO_ENCONTRADA);
        }

        Receta recetaExistente = recetaServicio.findById(recetaId);
        if (recetaExistente == null) {
            throw new AppException(ErrorCode.RECETA_NO_ENCONTRADA);
        }

        //Usuario usuario = usuarioService.getUsuarioAutenticado();

        TipoResultadoReceta tipoResultado = TipoResultadoReceta.MATERIAL;
  

        List<RecetaDetalle> recetaDetalles = (recetaDto.getRecetaDetalles() == null
                ? List.<com.api.apos.aplication.inventario.receta.dto.RecetaDetallesDto>of()
                : recetaDto.getRecetaDetalles()).stream()
                .map(detalleDto -> RecetaDetalle.builder()
                        .cantidad(detalleDto.getCantidad())
                        .unidadMedida(detalleDto.getUnidadMedida())
                        .costo(detalleDto.getCosto())
                        .material(materialService.findById(detalleDto.getMaterialId()))
                        .build())
                .toList();


        // Actualizar los campos de la receta existente
        recetaExistente.setNombre(recetaDto.getNombre());
        recetaExistente.setCostoTotal(recetaDto.getCostoTotal());
        recetaExistente.setTipoResultado(tipoResultado);
        recetaExistente.setInstrucciones(recetaDto.getInstrucciones());
        recetaExistente.setNotas(recetaDto.getNotas());
        recetaExistente.setPorcentajeSobreCostos(recetaDto.getPorcentajeSobreCostos());
        recetaExistente.setRendimiento(recetaDto.getRendimiento());

        if (recetaDto.getMaterialResultado() != null && recetaExistente.getMaterialResultado() != null) {
            recetaExistente.getMaterialResultado().setNombre(recetaDto.getMaterialResultado().getNombre());
            recetaExistente.getMaterialResultado().setUnidad(recetaDto.getMaterialResultado().getUnidad());
        }

        // Limpiar los detalles anteriores y agregar los nuevos
        recetaExistente.getRecetaDetalles().clear();
        recetaDetalles.forEach(recetaExistente::addRecetaDetalle);

        Receta recetaActualizada = recetaServicio.save(recetaExistente);
        return RecetaMapper.toDto(recetaActualizada);
    }
}

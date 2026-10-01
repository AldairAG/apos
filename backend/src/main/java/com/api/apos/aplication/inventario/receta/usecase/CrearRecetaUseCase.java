package com.api.apos.aplication.inventario.receta.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.aplication.inventario.receta.mapper.RecetaMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
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
public class CrearRecetaUseCase {

    private final RecetaService recetaServicio;

    private final MaterialService materialService;

    private final UsuarioService usuarioService;

    @Transactional 
    public RecetaDto execute(RecetaDto recetaDto) {

        Usuario usuario = usuarioService.getUsuarioAutenticado();

        TipoResultadoReceta tipoResultado = recetaDto.getTipoResultado() == null
                ? TipoResultadoReceta.PRODUCTO
                : recetaDto.getTipoResultado();
        var materialResultado = tipoResultado == TipoResultadoReceta.MATERIAL
                ? materialService.findById(recetaDto.getMaterialResultadoId())
                : null;
        if ((tipoResultado == TipoResultadoReceta.MATERIAL && materialResultado == null)
                || (tipoResultado == TipoResultadoReceta.PRODUCTO && recetaDto.getMaterialResultadoId() != null)) {
            throw new AppException(ErrorCode.RECETA_RESULTADO_INVALIDO);
        }

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
        if (tipoResultado == TipoResultadoReceta.MATERIAL
                && (recetaDetalles.isEmpty() || recetaDetalles.stream().anyMatch(detalle -> detalle.getMaterial() == null
                        || detalle.getMaterial().getId().equals(materialResultado.getId())))) {
            throw new AppException(ErrorCode.RECETA_RESULTADO_INVALIDO);
        }

        Receta receta = Receta.builder()
                .nombre(recetaDto.getNombre())
                .costoTotal(recetaDto.getCostoTotal())
                .tipoResultado(tipoResultado)
                .materialResultado(materialResultado)
                .instrucciones(recetaDto.getInstrucciones())
                .notas(recetaDto.getNotas())
                .porcentajeSobreCostos(recetaDto.getPorcentajeSobreCostos())
                .rendimiento(recetaDto.getRendimiento())
                .empresa(usuario.getEmpresa())
                .build();

        recetaDetalles.forEach(receta::addRecetaDetalle);

        Receta recetaGuardada = recetaServicio.save(receta);
        return RecetaMapper.toDto(recetaGuardada);
    }

}

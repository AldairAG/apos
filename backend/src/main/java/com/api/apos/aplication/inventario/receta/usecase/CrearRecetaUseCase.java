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

        List<RecetaDetalle> recetaDetalles = recetaDto.getRecetaDetalles().stream()
                .map(detalleDto -> RecetaDetalle.builder()
                        .cantidad(detalleDto.getCantidad())
                        .unidadMedida(detalleDto.getUnidadMedida())
                        .costo(detalleDto.getCosto())
                        .cantidad(detalleDto.getCantidad())
                        .material(materialService.findById(detalleDto.getMaterialId()))
                        .build())
                .toList();

        Receta receta = Receta.builder()
                .nombre(recetaDto.getNombre())
                .costoTotal(recetaDto.getCostoTotal())
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

package com.api.apos.aplication.inventario.receta.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.inventario.receta.dto.RecetaDetallesDto;
import com.api.apos.aplication.inventario.receta.dto.RecetaDto;
import com.api.apos.aplication.inventario.receta.mapper.RecetaMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.inventario.material.Material;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.enums.TipoResultadoReceta;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearRecetaUseCase {

        private final RecetaService recetaServicio;

        private final MaterialService materialService;

        private final UsuarioService usuarioService;

        @Transactional
        public RecetaDto execute(RecetaDto recetaDto) {

                // Obtiene el usuario autenticado para asociar la receta a su empresa.
                Usuario usuario = usuarioService.getUsuarioAutenticado();

                // Convierte los detalles recibidos en el DTO a entidades RecetaDetalle.
                // Si no se enviaron detalles, utiliza una lista vacía.
                List<RecetaDetalle> recetaDetalles = (recetaDto.getRecetaDetalles() == null
                                ? List.<RecetaDetallesDto>of()
                                : recetaDto.getRecetaDetalles())
                                .stream()
                                .map(detalleDto -> RecetaDetalle.builder()

                                                // Cantidad del material utilizado en la receta.
                                                .cantidad(detalleDto.getCantidad())

                                                // Unidad de medida utilizada.
                                                .unidadMedida(detalleDto.getUnidadMedida())

                                                // Costo del material dentro de la receta.
                                                .costo(detalleDto.getCosto())

                                                // Busca y asigna el material utilizado.
                                                .material(materialService.findById(detalleDto.getMaterialId()))

                                                .build())
                                .toList();

                

                // Construye la entidad del material creado como resultado de la receta.
                Material materialResultado = materialService.save(Material.builder()
                                .nombre(recetaDto.getMaterialResultado().getNombre())
                                .unidad(recetaDto.getMaterialResultado().getUnidad())
                                .cantidad(recetaDto.getRendimiento())
                                .precio(recetaDto.getCostoTotal().doubleValue())
                                .empresa(usuario.getEmpresa())
                                .build());

                // Construye la entidad Receta con la información recibida.
                Receta receta = Receta.builder()

                                // Nombre de la receta.
                                .nombre(recetaDto.getNombre())

                                // Costo total de elaboración.
                                .costoTotal(recetaDto.getCostoTotal())

                                // Indica si la receta genera un PRODUCTO o MATERIAL.
                                .tipoResultado(TipoResultadoReceta.MATERIAL)

                                // Material que se obtiene como resultado, si corresponde.
                                .materialResultado(materialResultado)

                                // Instrucciones de elaboración.
                                .instrucciones(recetaDto.getInstrucciones())

                                // Notas adicionales.
                                .notas(recetaDto.getNotas())

                                // Cantidad de producto/material que genera la receta.
                                .rendimiento(recetaDto.getRendimiento())

                                // Empresa propietaria de la receta.
                                .empresa(usuario.getEmpresa())

                                .materialResultado(materialResultado)

                                .build();

                // Agrega cada detalle a la receta.
                // Esto también mantiene la relación bidireccional correctamente.
                recetaDetalles.forEach(receta::addRecetaDetalle);

                // Guarda la receta y obtiene la entidad persistida.
                Receta recetaGuardada = recetaServicio.save(receta);

                // Convierte la entidad guardada nuevamente a DTO para devolverla.
                return RecetaMapper.toDto(recetaGuardada);
        }

}

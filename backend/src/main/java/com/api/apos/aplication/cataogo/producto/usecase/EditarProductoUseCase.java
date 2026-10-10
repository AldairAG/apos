package com.api.apos.aplication.cataogo.producto.usecase;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.cataogo.producto.mapper.ProductoMapper;
import com.api.apos.aplication.inventario.receta.dto.RecetaDetallesDto;
import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.grupo_producto.ModificadorProducto;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EditarProductoUseCase {

    private final ProductoService productoService;

    private final CategoriaService categoriaService;
    
    private final MaterialService materialService;

    public ProductoDto execute(ProductoDto productoDto) {

        Producto producto = productoService.findById(productoDto.getId());

        producto.setNombre(productoDto.getNombre());
        producto.setPrecio(productoDto.getPrecio());
        producto.setMargenGanancia(productoDto.getMargenGanancia());
        producto.setCosto(productoDto.getCosto());

        // Actualizar categoria
        if (productoDto.getCategoriaId() != producto.getCategoria().getId()) {
            producto.setCategoria(categoriaService.findById(productoDto.getCategoriaId()));
        }

        // actualizar modificadores comparando los existentes con los nuevos o
        // eliminados
        Set<Long> modificadoresActuales = producto.getModificadorProductos()
                .stream()
                .map(mp -> mp.getModificador().getId())
                .collect(Collectors.toSet());

        Set<Long> modificadoresNuevos = new HashSet<>(
                productoDto.getModificadorIds() != null
                        ? productoDto.getModificadorIds()
                        : Collections.emptyList());

        // Modificadores que se deben agregar
        Set<Long> agregados = new HashSet<>(modificadoresNuevos);
        agregados.removeAll(modificadoresActuales);

        // Modificadores que se deben eliminar
        Set<Long> eliminados = new HashSet<>(modificadoresActuales);
        eliminados.removeAll(modificadoresNuevos);

        // Actualizar modificadores en el producto
        for (Long id : agregados) {
            Modificador modificador = new Modificador();
            modificador.setId(id);

            ModificadorProducto modificadorProducto = ModificadorProducto.builder()
                    .modificador(modificador)
                    .build();

            producto.addModificador(modificadorProducto);
        }

        // Eliminar modificadores
        for (Long id : eliminados) {
            producto.removeModificador(id);
        }

        // Actualizar recetaDetalles si es necesario (similar a los modificadores)
        // 1. Obtener los detalles actuales, indexados por materialId
        Map<Long, RecetaDetalle> actuales = producto.getRecetaDetalles()
                .stream()
                .collect(Collectors.toMap(
                        rd -> rd.getMaterial().getId(),
                        Function.identity()));

        // 2. Obtener los detalles enviados en el DTO
        List<RecetaDetallesDto> detallesNuevos = productoDto.getRecetaDetalles() != null
                ? productoDto.getRecetaDetalles()
                : Collections.emptyList();

        Set<Long> materialesNuevos = detallesNuevos.stream()
                .map(RecetaDetallesDto::getMaterialId)
                .collect(Collectors.toSet());

        // 3. Eliminar los detalles cuyos materiales ya no vienen en el DTO
        List<Long> materialesEliminados = actuales.keySet().stream()
                .filter(id -> !materialesNuevos.contains(id))
                .toList();

        for (Long materialId : materialesEliminados) {
            producto.removeRecetaDetallePorMaterialId(materialId);
        }

        // 4. Agregar o actualizar detalles
        for (RecetaDetallesDto dto : detallesNuevos) {
            Long materialId = dto.getMaterialId();

            RecetaDetalle detalleExistente = actuales.get(materialId);

            if (detalleExistente != null) {
                // El material ya existe: actualizar sus propiedades
                detalleExistente.setCantidad(dto.getCantidad());
                detalleExistente.setUnidadMedida(dto.getUnidadMedida());
                detalleExistente.setCosto(dto.getCosto());

            } else {
                // El material es nuevo: crear un detalle
                RecetaDetalle nuevoDetalle = RecetaDetalle.builder()
                        .material(materialService.findById(materialId))
                        .cantidad(dto.getCantidad())
                        .unidadMedida(dto.getUnidadMedida())
                        .costo(dto.getCosto())
                        .build();

                producto.addRecetaDetalle(nuevoDetalle);
            }
        }

        productoService.save(producto);

        return ProductoMapper.toDto(producto);

    }
}

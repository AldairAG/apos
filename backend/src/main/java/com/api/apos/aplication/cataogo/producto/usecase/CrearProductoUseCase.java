package com.api.apos.aplication.cataogo.producto.usecase;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;
import com.api.apos.aplication.cataogo.producto.mapper.ProductoMapper;
import com.api.apos.aplication.inventario.existencia.dto.ExistenciaDto;
import com.api.apos.aplication.inventario.existencia.mapper.ExistenciaMapper;
import com.api.apos.aplication.inventario.existencia.usecase.CrearExistenciaUseCase;
import com.api.apos.aplication.inventario.receta.dto.RecetaDetallesDto;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.catalogo.grupo_producto.ModificadorProducto;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.material.MaterialService;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearProductoUseCase {

        private final ProductoService productoService;

        private final SucursalService sucursalService;

        private final ModificadorService modificadorService;

        private final ExistenciaService existenciaService;

        private final CategoriaService categoriaService;

        private final MaterialService materialService;

        private final CrearExistenciaUseCase crearExistenciaUseCase;

        @Transactional
        public ProductoDto execute(ProductoDto productoDto) {

                // 1. Validar datos de entrada
                productoDto.validarDatosCreacion();

                // 2. Obtener sucursal
                Sucursal sucursal = sucursalService.findById(
                                productoDto.getSucursalId());

                // 3. Obtener categoría
                Categoria categoria = categoriaService.findById(
                                productoDto.getCategoriaId());

                // 5. Obtener modificadores
                List<Long> modificadorIds = productoDto.getModificadorIds() != null
                                ? productoDto.getModificadorIds()
                                : Collections.emptyList();

                List<Modificador> modificadores = modificadorIds.isEmpty()
                                ? Collections.emptyList()
                                : modificadorService.findByIds(modificadorIds);

                // 6. Crear existencias faltantes
                if (productoDto.getRecetaDetalles() != null && !productoDto.getRecetaDetalles().isEmpty()) {

                        List<Long> materialIds = productoDto.getRecetaDetalles()
                                        .stream()
                                        .map(detalle -> detalle.getMaterialId())
                                        .distinct()
                                        .toList();

                        List<Long> materialesSinExistencia = existenciaService.findMaterialIdsWithoutExistencia(
                                        materialIds,
                                        sucursal.getId());

                        if (!materialesSinExistencia.isEmpty()) {
                                for (Long id : materialesSinExistencia) {
                                        ExistenciaDto existenciaDto = ExistenciaMapper
                                                        .toDto(new Existencia().initCero());

                                        existenciaDto.setMaterialId(id);
                                        existenciaDto.setSucursalId(sucursal.getId());

                                        crearExistenciaUseCase.execute(existenciaDto);
                                }
                        }
                }

                // 7. Crear producto
                Producto producto = Producto.builder()
                                .categoria(categoria)
                                .nombre(productoDto.getNombre())
                                .precio(productoDto.getPrecio())
                                .costo(productoDto.getCosto())
                                .porcentajeSobreCostos(productoDto.getPorcentajeSobreCostos())
                                .disponible(productoDto.getDisponible())
                                .margenGanancia(productoDto.getMargenGanancia())
                                .build();

                // 7.1 Materiales del producto
                if (productoDto.getRecetaDetalles() != null) {
                        for (RecetaDetallesDto detalleDto : productoDto.getRecetaDetalles()) {
                                producto.addRecetaDetalle(RecetaDetalle.builder()
                                                .cantidad(detalleDto.getCantidad())
                                                .unidadMedida(detalleDto.getUnidadMedida())
                                                .costo(detalleDto.getCosto())
                                                .material(materialService.findById(detalleDto.getMaterialId()))
                                                .build());
                        }
                }

                // 8. Crear relaciones Producto-Modificador
                for (Modificador modificador : modificadores) {

                        ModificadorProducto modificadorProducto = ModificadorProducto.builder()
                                        .modificador(modificador)
                                        .build();

                        producto.addModificador(modificadorProducto);
                }

                // 9. Asociar producto a sucursal
                sucursal.addProducto(producto);

                // 10. Guardar producto
                Producto productoNuevo = productoService.save(producto);

                // 11. Retornar DTO
                return ProductoMapper.toDto(productoNuevo);
        }

}

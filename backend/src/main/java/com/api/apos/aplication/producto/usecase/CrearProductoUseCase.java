package com.api.apos.aplication.producto.usecase;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.producto.dto.ProductoDto;
import com.api.apos.aplication.producto.mapper.ProductoMapper;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.categoria.CategoriaService;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.catalogo.grupo_producto.ModificadorProducto;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.domain.inventario.existencia.ExistenciaService;
import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.inventario.receta.RecetaService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearProductoUseCase {

        private final ProductoService productoService;

        private final SucursalService sucursalService;

        private final RecetaService recetaService;

        private final ModificadorService modificadorService;

        private final ExistenciaService existenciaService;

        private final CategoriaService categoriaService;

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

                // 4. Obtener receta
                Receta receta = productoDto.getRecetaId() != null
                                ? recetaService.findById(productoDto.getRecetaId())
                                : null;

                // 5. Obtener modificadores
                List<Long> modificadorIds = productoDto.getModificadorIds() != null
                                ? productoDto.getModificadorIds()
                                : Collections.emptyList();

                List<Modificador> modificadores = modificadorIds.isEmpty()
                                ? Collections.emptyList()
                                : modificadorService.findByIds(modificadorIds);

                // 6. Crear existencias faltantes
                if (receta != null) {

                        List<Long> materialIds = receta.getRecetaDetalles()
                                        .stream()
                                        .map(detalle -> detalle.getMaterial().getId())
                                        .distinct()
                                        .toList();

                        List<Long> materialesSinExistencia = existenciaService.findMaterialIdsWithoutExistencia(
                                        materialIds,
                                        sucursal.getId());

                        existenciaService.crearExistenciasFaltantes(
                                        materialesSinExistencia,
                                        sucursal);
                }

                // 7. Crear producto
                Producto producto = Producto.builder()
                                .categoria(categoria)
                                .receta(receta)
                                .nombre(productoDto.getNombre())
                                .precio(productoDto.getPrecio())
                                .costo(productoDto.getCosto())
                                .disponible(productoDto.getDisponible())
                                .build();

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

package com.api.apos.aplication.pos.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.dto.OpcionDto;
import com.api.apos.aplication.cataogo.producto.dto.ProductoDto;

import com.api.apos.aplication.pos.dto.CategoriaProductoDto;
import com.api.apos.aplication.pos.dto.DetalleOrdenDto;
import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.pos.detalle_orden.DetalleOrden;
import com.api.apos.domain.pos.orden.Orden;

public class PosMapper {

        public static CategoriaProductoDto mapToCategoriaProductoDtoList(Categoria categoria) {

                List<ProductoDto> productosDto = categoria
                                .getProductos()
                                .stream()
                                .map(PosMapper::mapToProductoDto)
                                .collect(Collectors.toList());

                return CategoriaProductoDto.builder()
                                .categoria(categoria.getNombre())
                                .productos(productosDto)
                                .build();

        }

        public static OrdenDto mapToOrdenDto(Orden orden) {

                List<DetalleOrdenDto> detalleOrdenDto = orden
                                .getDetalles()
                                .stream()
                                .map(PosMapper::mapToDetalleOrdenDto)
                                .collect(Collectors.toList());

                return OrdenDto.builder()
                                .id(orden.getId())
                                .detalles(detalleOrdenDto)
                                .total(orden.getTotal())
                                .estado(orden.getEstado())
                                .build();

        }

        public static ProductoDto mapToProductoDto(Producto producto) {

                List<ModificadorDto> modificadoresDto = producto
                                .getModificadorProductos()
                                .stream()
                                .map(modificador -> {

                                        List<OpcionDto> opcionDto = modificador
                                                        .getModificador()
                                                        .getOpciones()
                                                        .stream()
                                                        .map(opcional -> OpcionDto
                                                                        .builder()
                                                                        .id(opcional.getId())
                                                                        .nombre(opcional.getNombre())
                                                                        .precio(opcional.getPrecio())
                                                                        .build())
                                                        .collect(Collectors
                                                                        .toList());

                                        return ModificadorDto.builder()
                                                        .id(modificador.getModificador()
                                                                        .getId())
                                                        .nombre(modificador
                                                                        .getModificador()
                                                                        .getNombre())
                                                        .opciones(opcionDto)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                ProductoDto productoDto = ProductoDto.builder()
                                .id(producto.getId())
                                .nombre(producto.getNombre())
                                .precio(producto.getPrecio())
                                .modificadores(modificadoresDto)
                                .disponible(producto.getDisponible())
                                .build();

                return productoDto;

        }

        public static DetalleOrdenDto mapToDetalleOrdenDto(DetalleOrden detalleOrden) {

                List<OpcionDto> modificadoresDto = detalleOrden.getModificadores()
                                .stream()
                                .map(modificador -> OpcionDto.builder()
                                                .id(modificador.getOpcion().getId())
                                                .nombre(modificador.getOpcion().getNombre())
                                                .precio(modificador.getPrecioUnitario())
                                                .cantidad(modificador.getCantidad())
                                                .subTotal(modificador.getSubtotal())
                                                .build())
                                .collect(Collectors.toList());

                        return DetalleOrdenDto.builder()
                                        .id(detalleOrden.getId())
                                .cantidad(detalleOrden.getCantidad())
                                .modificadores(modificadoresDto)        
                                .build();
        }



}
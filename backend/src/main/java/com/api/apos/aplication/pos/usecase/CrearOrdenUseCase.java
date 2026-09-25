package com.api.apos.aplication.pos.usecase;

import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.aplication.cataogo.modificadores.dto.OpcionDto;
import com.api.apos.aplication.inventario.existencia.usecase.DescontarExistenciaByProductoIds;
import com.api.apos.aplication.pos.dto.DetalleOrdenDto;
import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.organizacion.sucursal.SucursalService;
import com.api.apos.domain.pos.detalle_modificador.DetalleModificador;
import com.api.apos.domain.pos.detalle_orden.DetalleOrden;
import com.api.apos.domain.pos.mesa.Mesa;
import com.api.apos.domain.pos.mesa.MesaService;
import com.api.apos.domain.pos.orden.Orden;
import com.api.apos.domain.pos.orden.OrdenService;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

@Service
@AllArgsConstructor
public class CrearOrdenUseCase {

    private final OrdenService ordenService;

    private final SucursalService sucursalService;

    private final MesaService mesaService;

    private final ModificadorService modificadorService;

    private final ProductoService productoService;

    private final DescontarExistenciaByProductoIds descontarExistenciaByProductoId;


    public void execute(OrdenDto ordenDto) {

        // Obtener sucursal
        Sucursal sucursal = sucursalService.findById(ordenDto.getSucursalId());

        // OIbtener los productos que incluye la orden

        List<Long> productoIds = ordenDto.getDetalles().stream()
                .map(DetalleOrdenDto::getProductoId)
                .distinct()
                .toList();

        Map<Long, Producto> productos = productoService
                .findAllById(productoIds)
                .stream()
                .collect(Collectors.toMap(Producto::getId, Function.identity()));

        // Obtener los modificadores que incluyen las opciones de los detalles de la
        // orden

        List<Long> opcionIds = ordenDto.getDetalles().stream()
                .flatMap(detalle -> detalle.getModificadores().stream())
                .map(OpcionDto::getId)
                .distinct()
                .toList();

        Map<Long, Modificador> modificadores = modificadorService
                .findByOpcionIds(opcionIds)
                .stream()
                .collect(Collectors.toMap(Modificador::getId, Function.identity()));

        // Mapear los detalles de la orden con sus modificadores correspondientes
        List<DetalleOrden> detallesOrden = ordenDto.getDetalles().stream()
                .map(detalleDto -> {

                    Producto producto = productos.get(detalleDto.getProductoId());

                    if (producto == null) {
                        throw new AppException(ErrorCode.PRODUCTO_NO_ENCONTRADO);
                    }

                    BigDecimal precio = producto.getPrecio();

                    DetalleOrden detalleOrden = DetalleOrden.builder()
                            .producto(producto)
                            .cantidad(detalleDto.getCantidad())
                            .precioUnitario(precio)
                            .subtotal(
                                    precio.multiply(
                                            BigDecimal.valueOf(detalleDto.getCantidad())))
                            .notas(detalleDto.getNotas())
                            .build();

                    List<DetalleModificador> modificadoresDetalle = detalleDto.getModificadores().stream()
                            .map(modificadorDto -> {

                                Modificador modificador = modificadores.get(modificadorDto.getId());

                                if (modificador == null) {
                                    throw new AppException(
                                            ErrorCode.MODIFICADOR_NO_ENCONTRADO);
                                }

                                BigDecimal precioModificador = modificadorDto.getPrecio();

                                return DetalleModificador.builder()
                                        .modificador(modificador)
                                        .cantidad(modificadorDto.getCantidad())
                                        .precioUnitario(precioModificador)
                                        .subtotal(
                                                precioModificador.multiply(
                                                        BigDecimal.valueOf(
                                                                modificadorDto.getCantidad())))
                                        .build();
                            })
                            .toList();

                    detalleOrden.setModificadores(modificadoresDetalle);

                    return detalleOrden;
                })
                .toList();

        // Crear orden

        Orden orden = Orden.builder()
                .descuento(ordenDto.getDescuento())
                .estado(EstadoOrden.PENDIENTE)
                .detalles(detallesOrden)
                .total(detallesOrden.stream()
                        .map(detalle -> detalle.getSubtotal()
                                .add(detalle.getModificadores().stream()
                                        .map(DetalleModificador::getSubtotal)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .createdAt(LocalDateTime.now())
                .sucursal(sucursal)
                .build();

        // Determinar si es una orden en mesa y obtener
        if (ordenDto.getMesaId() != null) {
            Mesa mesa = mesaService.findById(ordenDto.getMesaId());
            mesa.asignarOrdenActual(null);
        }

        // Descontar de inventario
        descontarExistenciaByProductoId.execute(productoIds);

        // Guardar la orden en la base de datos
        ordenService.save(orden);

    }

}

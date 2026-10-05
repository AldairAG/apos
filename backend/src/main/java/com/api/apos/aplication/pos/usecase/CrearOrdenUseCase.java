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
import com.api.apos.aplication.inventario.existencia.dto.ProductoDescuentoDto;
import com.api.apos.aplication.inventario.existencia.usecase.DescontarExistenciaByProductoIds;
import com.api.apos.aplication.pos.dto.DetalleOrdenDto;
import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.aplication.pos.mapper.PosMapper;
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

import jakarta.transaction.Transactional;

@Service
@AllArgsConstructor
public class CrearOrdenUseCase {

        private final OrdenService ordenService;

        private final SucursalService sucursalService;

        private final MesaService mesaService;

        private final ModificadorService modificadorService;

        private final ProductoService productoService;

        private final DescontarExistenciaByProductoIds descontarExistenciaByProductoId;

        @Transactional
        public OrdenDto execute(OrdenDto ordenDto) {

                // 1. Obtener la sucursal donde se registrará la orden.
                Sucursal sucursal = sucursalService.findById(ordenDto.getSucursalId());

                // 2. Obtener los productos utilizados en la orden.
                Map<Long, Producto> productos = obtenerProductos(ordenDto);

                // 3. Obtener los modificadores asociados a las opciones recibidas.
                // El mapa queda: opcionId -> modificador.
                Map<Long, Modificador> modificadoresPorOpcion = obtenerModificadores(ordenDto);

                // 4. Convertir los detalles del DTO en entidades DetalleOrden.
                List<DetalleOrden> detalles = crearDetallesOrden(
                                ordenDto,
                                productos,
                                modificadoresPorOpcion);

                // 5. Crear la entidad Orden.
                Orden orden = crearOrden(ordenDto, sucursal, detalles);

                // 6. Si la orden corresponde a una mesa, actualizar su estado.
                asignarMesaSiCorresponde(ordenDto);

                // 7. Descontar del inventario los productos vendidos.
                descontarInventario(orden);

                // 8. Guardar la orden y devolver el DTO.
                Orden ordenGuardada = ordenService.save(orden);

                return PosMapper.mapToOrdenDto(ordenGuardada);
        }

        /**
         * Obtiene todos los productos utilizados en la orden y los organiza
         * en un mapa para poder encontrarlos rápidamente por su ID.
         */
        private Map<Long, Producto> obtenerProductos(OrdenDto ordenDto) {

                List<Long> productoIds = ordenDto.getDetalles().stream()
                                .map(DetalleOrdenDto::getProductoId)
                                .distinct()
                                .toList();

                return productoService.findAllById(productoIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                Producto::getId,
                                                Function.identity()));
        }

        /**
         * Obtiene los modificadores relacionados con las opciones recibidas
         * en los detalles de la orden.
         *
         * El mapa resultante utiliza el ID de la opción como clave:
         *
         * opcionId -> Modificador
         */
        private Map<Long, Modificador> obtenerModificadores(OrdenDto ordenDto) {

                List<Long> opcionIds = ordenDto.getDetalles().stream()
                                .flatMap(detalle -> detalle.getModificadores().stream())
                                .map(OpcionDto::getId)
                                .distinct()
                                .toList();

                return modificadorService.findByOpcionIds(opcionIds)
                                .stream()
                                .flatMap(modificador -> modificador.getOpciones().stream()
                                                .map(opcion -> Map.entry(
                                                                opcion.getId(),
                                                                modificador)))
                                .collect(Collectors.toMap(
                                                Map.Entry::getKey,
                                                Map.Entry::getValue));
        }

        /**
         * Convierte los detalles recibidos desde el frontend en entidades
         * DetalleOrden, incluyendo sus modificadores.
         */
        private List<DetalleOrden> crearDetallesOrden(
                        OrdenDto ordenDto,
                        Map<Long, Producto> productos,
                        Map<Long, Modificador> modificadoresPorOpcion) {

                return ordenDto.getDetalles().stream()
                                .map(detalleDto -> crearDetalleOrden(
                                                detalleDto,
                                                productos,
                                                modificadoresPorOpcion))
                                .toList();
        }

        /**
         * Crea un detalle individual de la orden.
         */
        private DetalleOrden crearDetalleOrden(
                        DetalleOrdenDto detalleDto,
                        Map<Long, Producto> productos,
                        Map<Long, Modificador> modificadoresPorOpcion) {

                // Buscar el producto correspondiente.
                Producto producto = productos.get(detalleDto.getProductoId());

                if (producto == null) {
                        throw new AppException(ErrorCode.PRODUCTO_NO_ENCONTRADO);
                }

                // El precio se toma directamente del producto.
                BigDecimal precio = producto.getPrecio();

                // Crear el detalle principal.
                DetalleOrden detalleOrden = DetalleOrden.builder()
                                .producto(producto)
                                .cantidad(detalleDto.getCantidad())
                                .precioUnitario(precio)
                                .subtotal(
                                                precio.multiply(
                                                                BigDecimal.valueOf(detalleDto.getCantidad())))
                                .notas(detalleDto.getNotas())
                                .build();

                // Crear los modificadores del detalle.
                List<DetalleModificador> detallesModificadores = crearDetallesModificadores(
                                detalleDto,
                                modificadoresPorOpcion);

                detallesModificadores.forEach(detalleOrden::addModificador);

                return detalleOrden;
        }

        /**
         * Convierte las opciones recibidas del frontend en
         * DetalleModificador.
         */
        private List<DetalleModificador> crearDetallesModificadores(
                        DetalleOrdenDto detalleDto,
                        Map<Long, Modificador> modificadoresPorOpcion) {

                return detalleDto.getModificadores().stream()
                                .map(modificadorDto -> {

                                        // El ID recibido corresponde a una Opción,
                                        // por eso buscamos utilizando el opcionId.
                                        Modificador modificador = modificadoresPorOpcion.get(modificadorDto.getId());

                                        if (modificador == null) {
                                                throw new AppException(
                                                                ErrorCode.MODIFICADOR_NO_ENCONTRADO);
                                        }

                                        BigDecimal precio = modificadorDto.getPrecio();
                                        int cantidad = modificadorDto.getCantidad();

                                        return DetalleModificador.builder()

                                                        // Aquí puedes activar esta relación si
                                                        // DetalleModificador debe guardar el modificador.
                                                        // .modificador(modificador)

                                                        .cantidad(cantidad)
                                                        .precioUnitario(precio)
                                                        .opcion(modificador.getOpciones().stream().filter(opcion -> opcion.getId().equals(modificadorDto.getId())).findFirst().orElse(null))
                                                        .subtotal(
                                                                        precio.multiply(
                                                                                        BigDecimal.valueOf(cantidad)))
                                                        .build();
                                })
                                .toList();
        }

        /**
         * Construye la entidad Orden a partir de los datos recibidos
         * y los detalles previamente procesados.
         */
        private Orden crearOrden(
                        OrdenDto ordenDto,
                        Sucursal sucursal,
                        List<DetalleOrden> detalles) {

                // Calcula el total sumando:
                // subtotal del producto + subtotal de sus modificadores.
                BigDecimal total = detalles.stream()
                                .map(detalle -> detalle.getSubtotal()
                                                .add(
                                                                detalle.getModificadores().stream()
                                                                                .map(DetalleModificador::getSubtotal)
                                                                                .reduce(
                                                                                                BigDecimal.ZERO,
                                                                                                BigDecimal::add)))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                Orden orden = Orden.builder()
                                .descuento(ordenDto.getDescuento())
                                .estado(EstadoOrden.PENDIENTE)
                                .tipo(ordenDto.getTipo())
                                .total(total)
                                .createdAt(LocalDateTime.now())
                                .sucursal(sucursal)
                                .build();

                detalles.forEach(orden::addDetalle);

                return orden;
        }

        /**
         * Si la orden corresponde a una mesa, actualiza la orden actual
         * de dicha mesa.
         */
        private void asignarMesaSiCorresponde(OrdenDto ordenDto) {

                if (ordenDto.getMesaId() == null) {
                        return;
                }

                Mesa mesa = mesaService.findById(ordenDto.getMesaId());

                mesa.asignarOrdenActual(null);
        }

        /**
         * Descuenta del inventario las cantidades de productos
         * utilizadas en la orden.
         */
        private void descontarInventario(Orden orden) {

                List<ProductoDescuentoDto> productosDescuento = orden.getDetalles()
                                .stream()
                                .map(detalle -> ProductoDescuentoDto.builder()
                                                .productoId(detalle.getProducto().getId())
                                                .cantidad(detalle.getCantidad())
                                                .sucursalId(orden.getSucursal().getId())
                                                .build())
                                .toList();

                productosDescuento.forEach(
                                descontarExistenciaByProductoId::execute);
        }

}

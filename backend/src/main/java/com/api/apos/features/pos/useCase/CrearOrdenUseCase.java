package com.api.apos.features.pos.useCase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.catalogo.extra.entity.OpcionExtra;
import com.api.apos.domain.catalogo.extra.service.OpcionExtraService;
import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.producto.ProductoService;
import com.api.apos.domain.mesa.service.MesaService;
import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.domain.orden.entity.DetalleOrdenExtra;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;
import com.api.apos.features.cocina.CocinaWebSocketService;
import com.api.apos.features.pos.dto.CrearOrdenDTO;
import com.api.apos.features.pos.dto.OrdenResponseDTO;
import com.api.apos.features.pos.dto.CrearOrdenDTO.DetalleOrdenDTO;
import com.api.apos.features.pos.mapper.PosMapper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearOrdenUseCase {

    private final SucursalService sucursalService;
    private final OrdenService ordenService;
    private final ProductoService productoService;
    private final OpcionExtraService opcionExtraService;
    private final MesaService mesaService;
    private final CocinaWebSocketService cocinaWebSocketService;

    public OrdenResponseDTO crearOrden(CrearOrdenDTO crearOrdenDTO) {

        Sucursal sucursal = sucursalService.obtenerSucursalPorId(crearOrdenDTO.getSucursalId());

        Orden orden = Orden.builder()
                .tipo(crearOrdenDTO.getTipo())
                .numeroPersonas(crearOrdenDTO.getNumeroPersonas())
                .observaciones(crearOrdenDTO.getObservaciones())
                .nombreCliente(crearOrdenDTO.getNombreCliente())
                .telefonoCliente(crearOrdenDTO.getTelefonoCliente())
                .subtotal(crearOrdenDTO.getSubtotal())
                .descuento(crearOrdenDTO.getDescuento())
                .total(crearOrdenDTO.getSubtotal())
                .sucursal(sucursal)
                .build();

        List<DetalleOrden> detalles = mapDetalleOrdenDTOToEntity(crearOrdenDTO.getDetallesDTO());

        for (DetalleOrden detalle : detalles) {

            detalle.setOrden(orden);

            for (DetalleOrdenExtra extra : detalle.getExtras()) {
                extra.setDetalleOrden(detalle);
            }
        }

        orden.setDetalles(detalles);

        Orden ordenGuardada = ordenService.crearOrden(orden);

        if (crearOrdenDTO.getMesaId() != null && crearOrdenDTO.getMesaId() > 0) {
            mesaService.asignarOrdenAMesa(crearOrdenDTO.getMesaId(), ordenGuardada.getId());
        }

        cocinaWebSocketService.notificarOrdenCreada(orden);

        return PosMapper.mapOrdenToResponseDTO(ordenGuardada);
    }

    private List<DetalleOrden> mapDetalleOrdenDTOToEntity(List<DetalleOrdenDTO> detallesDTO) {
        List<DetalleOrden> detalles = detallesDTO.stream()
                .map(detalle -> {
                    Producto producto = productoService.obtenerProductoPorId(detalle.getProductoId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Producto no encontrado con ID: " + detalle.getProductoId()));

                    DetalleOrden detalleOrden = new DetalleOrden();
                    detalleOrden.setProducto(producto);
                    detalleOrden.setCantidad(detalle.getCantidad());
                    detalleOrden.setPrecioUnitario(detalle.getPrecioUnitario());
                    detalleOrden.setSubtotal(detalle.getSubtotal());

                    List<DetalleOrdenExtra> detalleExtraOrdenes = detalle.getExtras().stream()
                            .map(extra -> {
                                OpcionExtra opcionExtra = opcionExtraService
                                        .obtenerOpcionExtraPorId(extra.getOpcionExtraId())
                                        .orElseThrow(() -> new RuntimeException(
                                                "Opción extra no encontrada con ID: " + extra.getOpcionExtraId()));

                                DetalleOrdenExtra detalleExtraOrden = new DetalleOrdenExtra();
                                detalleExtraOrden.setOpcionExtra(opcionExtra);
                                detalleExtraOrden.setCantidad(extra.getCantidad());
                                detalleExtraOrden.setPrecioUnitario(extra.getPrecioUnitario());
                                detalleExtraOrden.setSubtotal(extra.getSubtotal());
                                return detalleExtraOrden;
                            })
                            .toList();

                    detalleOrden.setExtras(detalleExtraOrdenes);

                    return detalleOrden;
                })
                .toList();
        return detalles;
    }
}

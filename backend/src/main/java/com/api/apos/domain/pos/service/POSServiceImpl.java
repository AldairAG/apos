package com.api.apos.domain.pos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.api.apos.domain.extra.entity.OpcionExtra;
import com.api.apos.domain.extra.service.OpcionExtraService;
import com.api.apos.domain.mesa.Mesa;
import com.api.apos.domain.mesa.service.MesaService;
import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.domain.orden.entity.DetalleOrdenExtra;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.domain.pos.dto.CrearOrdenDTO;
import com.api.apos.domain.pos.dto.MesaResponseDTO;
import com.api.apos.domain.pos.dto.OrdenResponseDTO;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse;
import com.api.apos.domain.pos.dto.CrearOrdenDTO.DetalleOrdenDTO;
import com.api.apos.domain.pos.dto.OrdenResponseDTO.DetalleOrdenExtraResponseDTO;
import com.api.apos.domain.pos.dto.OrdenResponseDTO.DetalleOrdenResponseDTO;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse.GrupoExtraResponse;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse.OpcionExtraResponse;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse.ProductoGrupoExtraResponse;
import com.api.apos.domain.producto.Producto;
import com.api.apos.domain.producto.ProductoService;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class POSServiceImpl implements POSService {

    private final ProductoService productoService;

    private final SucursalService sucursalService;

    private final OpcionExtraService opcionExtraService;

    private final OrdenService ordenService;

    private final MesaService mesaService;

    @Override
    public List<ProductosBySucursalResponse> obtnerProdcutosBySucursal(Long sucursalId) {
        List<Producto> productos = productoService.obtenerProductosPorSucursal(sucursalId);

        List<ProductosBySucursalResponse> response = productos.stream()
                .map(producto -> {
                    ProductosBySucursalResponse res = new ProductosBySucursalResponse();
                    res.setId(producto.getId());
                    res.setNombre(producto.getNombre());
                    res.setDescripcion(producto.getDescripcion());
                    res.setPrecioVenta(producto.getPrecioVenta());
                    res.setTiempoPreparacion(producto.getTiempoPreparacion());
                    res.setActivo(producto.getActivo());
                    res.setDisponible(producto.getDisponible());
                    res.setDestacado(producto.getDestacado());
                    res.setCategoria(producto.getCategoria());
                    res.setGruposExtra(producto.getGruposExtra().stream()
                            .map(grupoExtra -> {
                                ProductoGrupoExtraResponse grupoExtraResponse = ProductoGrupoExtraResponse.builder()
                                        .id(grupoExtra.getId())
                                        .minimo(grupoExtra.getMinimo())
                                        .maximo(grupoExtra.getMaximo())
                                        .obligatorio(grupoExtra.getObligatorio())
                                        .grupoExtra(GrupoExtraResponse.builder()
                                                .id(grupoExtra.getGrupoExtra().getId())
                                                .nombre(grupoExtra.getGrupoExtra().getNombre())
                                                .descripcion(grupoExtra.getGrupoExtra().getDescripcion())
                                                .activo(grupoExtra.getGrupoExtra().getActivo())
                                                .opciones(grupoExtra.getGrupoExtra().getOpciones().stream()
                                                        .map(opcion -> {
                                                            OpcionExtraResponse opcionResponse = OpcionExtraResponse
                                                                    .builder()
                                                                    .id(opcion.getId())
                                                                    .nombre(opcion.getNombre())
                                                                    .precio(opcion.getPrecio())
                                                                    .activo(opcion.getActivo())
                                                                    .build();
                                                            return opcionResponse;
                                                        })
                                                        .toList())
                                                .build())
                                        .build();
                                return grupoExtraResponse;
                            })
                            .toList());
                    return res;
                })
                .toList();

        return response;
    }

    @Override
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

        if (crearOrdenDTO.getMesaId() != null) {
            mesaService.asignarOrdenAMesa(crearOrdenDTO.getMesaId(), ordenGuardada.getId());
        }



        return mapOrdenToResponseDTO(ordenGuardada);
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

    private OrdenResponseDTO mapOrdenToResponseDTO(Orden orden) {
        OrdenResponseDTO ordenResponseDTO = new OrdenResponseDTO();
        ordenResponseDTO.setId(orden.getId());
        ordenResponseDTO.setFolio(orden.getFolio());
        ordenResponseDTO.setTipo(orden.getTipo());
        ordenResponseDTO.setEstado(orden.getEstado());
        ordenResponseDTO.setNumeroPersonas(orden.getNumeroPersonas());
        ordenResponseDTO.setTiempoPreparacion(orden.getTiempoPreparacion());
        ordenResponseDTO.setObservaciones(orden.getObservaciones());
        ordenResponseDTO.setSubtotal(orden.getSubtotal());
        ordenResponseDTO.setDescuento(orden.getDescuento());
        ordenResponseDTO.setPropina(orden.getPropina());
        ordenResponseDTO.setTotal(orden.getTotal());
        ordenResponseDTO.setFecha(orden.getFecha());
        ordenResponseDTO.setHoraEntrega(orden.getHoraEntrega());
        ordenResponseDTO.setCreatedAt(orden.getCreatedAt());
        ordenResponseDTO.setMesa(orden.getMesa());
        ordenResponseDTO.setDetalles(orden.getDetalles().stream()
                .map(this::mapDetalleOrdenToResponseDTO)
                .toList());

        return ordenResponseDTO;
    }

    private DetalleOrdenResponseDTO mapDetalleOrdenToResponseDTO(DetalleOrden detalleOrden) {
        DetalleOrdenResponseDTO detalleResponseDTO = new DetalleOrdenResponseDTO();
        detalleResponseDTO.setId(detalleOrden.getId());
        detalleResponseDTO.setNombreProducto(detalleOrden.getProducto().getNombre());
        detalleResponseDTO.setPrecioUnitario(detalleOrden.getPrecioUnitario());
        detalleResponseDTO.setCantidad(detalleOrden.getCantidad());
        detalleResponseDTO.setTotal(detalleOrden.getSubtotal());

        List<DetalleOrdenExtraResponseDTO> extras = detalleOrden.getExtras().stream()
                .map(extra -> {
                    DetalleOrdenExtraResponseDTO extraResponseDTO = new DetalleOrdenExtraResponseDTO();
                    extraResponseDTO.setId(extra.getId());
                    extraResponseDTO.setNombreExtra(extra.getOpcionExtra().getNombre());
                    extraResponseDTO.setPrecioExtra(extra.getOpcionExtra().getPrecio());
                    extraResponseDTO.setCantidad(extra.getCantidad());
                    extraResponseDTO.setTotal(extra.getSubtotal());
                    return extraResponseDTO;
                })
                .toList();

        detalleResponseDTO.setExtras(extras);

        return detalleResponseDTO;
    }

    @Override
    public Mesa cambiarEstadoMesa(Long mesaId, Boolean disponible) {
        return null;
    }

    @Override
    public List<OrdenResponseDTO> obtenerOrdenesPorSucursal(Long sucursalId) {
        List<Orden> ordenes = ordenService.obtenerOrdenesPorSucursal(sucursalId);

        List<OrdenResponseDTO> response = ordenes.stream()
                .map(this::mapOrdenToResponseDTO)
                .toList();

        return response;
    }

    @Override
    public List<MesaResponseDTO> obtenerMesasPorSucursal(Long sucursalId) {
        List<Mesa> mesas = mesaService.obtenerMesasPorSucursal(sucursalId);

        List<MesaResponseDTO> response = mesas.stream()
                .map(mesa -> {

                    MesaResponseDTO res = new MesaResponseDTO();
                    res.setId(mesa.getId());
                    res.setNombre(mesa.getNombre());
                    res.setEstado(mesa.getEstado());
                    res.setActiva(mesa.getActiva());

                    Optional<Orden> ordenActual = ordenService.obtenerOrdenPorId(mesa.getOrdenActual());
                    if (ordenActual.isPresent()) {
                        res.setOrdenActualDTO(mapOrdenToResponseDTO(ordenActual.get()));
                    } else {
                        res.setOrdenActualDTO(null);
                    }
                    return res;
                })
                .toList();

        return response;
    }

}

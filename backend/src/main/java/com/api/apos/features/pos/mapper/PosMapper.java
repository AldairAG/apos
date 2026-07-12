package com.api.apos.features.pos.mapper;

import java.util.List;

import com.api.apos.domain.catalogo.producto.dto.ProductoDTO;
import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.features.pos.dto.OrdenResponseDTO;
import com.api.apos.features.pos.dto.ProductosBySucursalResponse;
import com.api.apos.features.pos.dto.OrdenResponseDTO.DetalleOrdenExtraResponseDTO;
import com.api.apos.features.pos.dto.OrdenResponseDTO.DetalleOrdenResponseDTO;

public class PosMapper {

    public static ProductosBySucursalResponse toProductosBySucursalResponse(ProductoDTO producto) {
        if (producto == null) {
            return null;
        }
        ProductosBySucursalResponse res = new ProductosBySucursalResponse();
        res.setId(producto.getId());
        res.setNombre(producto.getNombre());
        // res.setCodigo(producto.getCodigo());
        res.setDescripcion(producto.getDescripcion());
        res.setPrecioVenta(producto.getPrecioVenta());
        // res.setCosto(producto.getCosto());
        // res.setMargen(producto.getMargen());
        res.setTiempoPreparacion(producto.getTiempoPreparacion());
        res.setActivo(producto.getActivo());
        res.setDisponible(producto.getDisponible());
        res.setDestacado(producto.getDestacado());
        // res.setCreatedAt(producto.getCreatedAt());
        // res.setUpdatedAt(producto.getUpdatedAt());
        // res.setCreatedBy(producto.getCreatedBy());
        // res.setUpdatedBy(producto.getUpdatedBy());
        // res.setReceta(producto.getReceta());
        res.setCategoria(producto.getCategoria());
        // Aquí puedes mapear los grupos extra si es necesario
        return res;
    }

    public static OrdenResponseDTO mapOrdenToResponseDTO(Orden orden) {
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
                .map(PosMapper::mapDetalleOrdenToResponseDTO)
                .toList());

        return ordenResponseDTO;
    }

    public static DetalleOrdenResponseDTO mapDetalleOrdenToResponseDTO(DetalleOrden detalleOrden) {
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
}

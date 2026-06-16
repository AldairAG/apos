package com.api.apos.domain.orden.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.api.apos.domain.orden.entity.DetalleOrden;

public interface DetalleOrdenService {
    DetalleOrden agregarDetalleOrden(DetalleOrden detalleOrden);
    DetalleOrden actualizarDetalleOrden(Long id, DetalleOrden detalleOrden);
    void eliminarDetalleOrden(Long id);
    Optional<DetalleOrden> obtenerDetalleOrdenPorId(Long id);
    List<DetalleOrden> obtenerDetallesPorOrden(Long idOrden);
    DetalleOrden actualizarCantidad(Long id, Integer nuevaCantidad);
    DetalleOrden calcularSubtotal(Long id);
    BigDecimal calcularTotalDetalle(Long id);
    DetalleOrden agregarExtra(Long idDetalle, Long idOpcionExtra);
    void eliminarExtra(Long idDetalle, Long idDetalleOrdenExtra);
    List<DetalleOrden> obtenerDetallesPorProducto(Long idProducto);
}

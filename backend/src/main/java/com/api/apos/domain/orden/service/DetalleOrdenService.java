package com.api.apos.domain.orden.service;

import java.util.List;

import com.api.apos.domain.orden.entity.DetalleOrden;

public interface DetalleOrdenService {
    DetalleOrden agregarDetalleOrden(DetalleOrden detalleOrden);
    DetalleOrden actualizarDetalleOrden(Long id, DetalleOrden detalleOrden);
    void eliminarDetalleOrden(Long id);
    DetalleOrden obtenerDetalleOrdenPorId(Long id);
    List<DetalleOrden> obtenerDetallesPorOrden(Long idOrden);
}

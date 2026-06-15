package com.api.apos.domain.orden.service;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;

public interface OrdenService {
    Orden crearOrden(Orden orden);
    Orden actualizarOrden(Long id, Orden orden);
    void cancelarOrden(Long id, String motivoCancelacion);
    Orden obtenerOrdenPorId(Long id);
    List<Orden> obtenerOrdenesPorSucursal(Long idSucursal);
    List<Orden> obtenerOrdenesPorEstado(Long idSucursal, EstadoOrden estado);
    List<Orden> obtenerOrdenesPorTipo(Long idSucursal, TipoOrden tipo);
    List<Orden> obtenerOrdenesPorMesa(Long idMesa);
    List<Orden> obtenerOrdenesPorFecha(Long idSucursal, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    Orden cambiarEstadoOrden(Long id, EstadoOrden nuevoEstado, Long idEmpleado);
}

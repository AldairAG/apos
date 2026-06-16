package com.api.apos.domain.orden.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;

public interface OrdenService {
    Orden crearOrden(Orden orden);
    Orden actualizarOrden(Long id, Orden orden);
    void cancelarOrden(Long id, String motivoCancelacion);
    Optional<Orden> obtenerOrdenPorId(Long id);
    Optional<Orden> obtenerOrdenPorFolio(String folio);
    List<Orden> obtenerOrdenesPorSucursal(Long idSucursal);
    List<Orden> obtenerOrdenesPorEstado(Long idSucursal, EstadoOrden estado);
    List<Orden> obtenerOrdenesPorTipo(Long idSucursal, TipoOrden tipo);
    List<Orden> obtenerOrdenesPorMesa(Long idMesa);
    List<Orden> obtenerOrdenesPorFecha(Long idSucursal, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<Orden> obtenerOrdenesDelDia(Long idSucursal, LocalDate fecha);
    List<Orden> obtenerOrdenesAbiertas(Long idSucursal);
    List<Orden> obtenerOrdenesActivas(Long idSucursal);
    Orden cambiarEstadoOrden(Long id, EstadoOrden nuevoEstado, Long idEmpleado);
    Orden calcularTotales(Long id);
    Orden aplicarDescuento(Long id, BigDecimal descuento);
    Orden aplicarPropina(Long id, BigDecimal propina);
    Orden cerrarOrden(Long id);
    Orden completarOrden(Long id, Long idEmpleado);
    BigDecimal calcularTotalOrden(Long id);
}

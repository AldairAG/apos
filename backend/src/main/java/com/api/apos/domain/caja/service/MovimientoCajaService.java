package com.api.apos.domain.caja.service;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.caja.entity.MovimientoCaja;
import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoMovimientoCaja;

public interface MovimientoCajaService {
    MovimientoCaja registrarMovimiento(MovimientoCaja movimiento);
    MovimientoCaja obtenerMovimientoPorId(Long id);
    List<MovimientoCaja> obtenerMovimientosPorCaja(Long idCaja);
    List<MovimientoCaja> obtenerMovimientosPorTipo(Long idCaja, TipoMovimientoCaja tipo);
    List<MovimientoCaja> obtenerMovimientosPorMetodoPago(Long idCaja, MetodoPago metodoPago);
    List<MovimientoCaja> obtenerMovimientosPorFecha(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    MovimientoCaja aprobarMovimiento(Long id, Long idAutorizador);
}

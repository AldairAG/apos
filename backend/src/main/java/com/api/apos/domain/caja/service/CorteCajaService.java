package com.api.apos.domain.caja.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.caja.entity.CorteCaja;

public interface CorteCajaService {
    CorteCaja abrirCorteCaja(Long idCaja, Long idEmpleado, BigDecimal montoInicial);
    CorteCaja cerrarCorteCaja(Long id, BigDecimal efectivoReal, String observaciones);
    CorteCaja obtenerCorteCajaPorId(Long id);
    CorteCaja obtenerCorteActivo(Long idCaja);
    List<CorteCaja> obtenerCortesPorCaja(Long idCaja);
    List<CorteCaja> obtenerCortesPorEmpleado(Long idEmpleado);
    List<CorteCaja> obtenerCortesPorFecha(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin);
}

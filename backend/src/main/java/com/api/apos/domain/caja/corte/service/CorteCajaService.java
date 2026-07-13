package com.api.apos.domain.caja.corte.service;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.caja.corte.CorteCaja;

public interface CorteCajaService {
    CorteCaja obtenerCorteCajaPorId(Long id);
    CorteCaja obtenerCorteActivo(Long idCaja);
    List<CorteCaja> obtenerCortesPorCaja(Long idCaja);
    List<CorteCaja> obtenerCortesPorEmpleado(Long idEmpleado);
    List<CorteCaja> obtenerCortesPorFecha(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    CorteCaja guardarCorteCaja(CorteCaja corteCaja);
    CorteCaja obtenerCorteCajaActual(Long idCaja);
}

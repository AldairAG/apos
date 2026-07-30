package com.api.apos.domain.caja.corte.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.domain.caja.corte.CorteCajaRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CorteCajaService {

    private final CorteCajaRepository corteCajaRepository;

    public CorteCaja obtenerCorteCajaPorId(Long id) {
        return corteCajaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Corte de caja no encontrado"));
    }

    public CorteCaja obtenerCorteActivo(Long idCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCorteActivo'");
    }

    public List<CorteCaja> obtenerCortesPorCaja(Long idCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCortesPorCaja'");
    }

    public List<CorteCaja> obtenerCortesPorEmpleado(Long idEmpleado) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCortesPorEmpleado'");
    }

    public List<CorteCaja> obtenerCortesPorFecha(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCortesPorFecha'");
    }

    public CorteCaja guardarCorteCaja(CorteCaja corteCaja) {
        return corteCajaRepository.save(corteCaja);
    }

    public CorteCaja obtenerCorteCajaActual(Long idCaja) {
        return corteCajaRepository.findFirstByCajaIdAndCerradoFalseOrderByFechaInicioDesc(idCaja)
                .orElseThrow(() -> new RuntimeException("No hay un corte de caja activo para la caja con ID: " + idCaja));
    }

    
}

package com.api.apos.domain.caja.corte.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.domain.caja.corte.CorteCajaRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CorteCajaServiceImpl implements CorteCajaService {

    private final CorteCajaRepository corteCajaRepository;

    @Override
    public CorteCaja obtenerCorteCajaPorId(Long id) {
        return corteCajaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Corte de caja no encontrado"));
    }

    @Override
    public CorteCaja obtenerCorteActivo(Long idCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCorteActivo'");
    }

    @Override
    public List<CorteCaja> obtenerCortesPorCaja(Long idCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCortesPorCaja'");
    }

    @Override
    public List<CorteCaja> obtenerCortesPorEmpleado(Long idEmpleado) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCortesPorEmpleado'");
    }

    @Override
    public List<CorteCaja> obtenerCortesPorFecha(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCortesPorFecha'");
    }

    @Override
    public CorteCaja guardarCorteCaja(CorteCaja corteCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'guardarCorteCaja'");
    }

    @Override
    public CorteCaja obtenerCorteCajaActual(Long idCaja) {
        return corteCajaRepository.findFirstByCajaIdAndCerradoFalseOrderByFechaInicioDesc(idCaja)
                .orElseThrow(() -> new RuntimeException("No hay un corte de caja activo para la caja con ID: " + idCaja));
    }

    
}

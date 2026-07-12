package com.api.apos.domain.caja.movimeinto.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.MovimientoRepository;
import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoMovimientoCaja;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MovimientoCajaServiceImpl implements MovimientoCajaService {

    private final MovimientoRepository movimientoRepository;

    @Override
    public MovimientoCaja registrarMovimiento(MovimientoCaja movimiento) {

        return movimientoRepository.save(movimiento);
    }
    
    @Override
    public MovimientoCaja obtenerMovimientoPorId(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientoPorId'");
    }

    @Override
    public List<MovimientoCaja> obtenerMovimientosPorCaja(Long idCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorCaja'");
    }

    @Override
    public List<MovimientoCaja> obtenerMovimientosPorTipo(Long idCaja, TipoMovimientoCaja tipo) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorTipo'");
    }

    @Override
    public List<MovimientoCaja> obtenerMovimientosPorMetodoPago(Long idCaja, MetodoPago metodoPago) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorMetodoPago'");
    }

    @Override
    public List<MovimientoCaja> obtenerMovimientosPorFecha(Long idCaja, LocalDateTime fechaInicio,
            LocalDateTime fechaFin) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorFecha'");
    }

    @Override
    public MovimientoCaja aprobarMovimiento(Long id, Long idAutorizador) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'aprobarMovimiento'");
    }
    
}

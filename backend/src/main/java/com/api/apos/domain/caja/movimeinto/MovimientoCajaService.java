package com.api.apos.domain.caja.movimeinto;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoMovimientoCaja;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MovimientoCajaService {

    private final MovimientoRepository movimientoRepository;

    public MovimientoCaja registrarMovimiento(MovimientoCaja movimiento) {

        return movimientoRepository.save(movimiento);
    }
    

    public MovimientoCaja obtenerMovimientoPorId(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientoPorId'");
    }


    public List<MovimientoCaja> obtenerMovimientosPorCaja(Long idCaja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorCaja'");
    }


    public List<MovimientoCaja> obtenerMovimientosPorTipo(Long idCaja, TipoMovimientoCaja tipo) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorTipo'");
    }


    public List<MovimientoCaja> obtenerMovimientosPorMetodoPago(Long idCaja, MetodoPago metodoPago) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorMetodoPago'");
    }


    public List<MovimientoCaja> obtenerMovimientosPorFecha(Long idCaja, LocalDateTime fechaInicio,
            LocalDateTime fechaFin) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerMovimientosPorFecha'");
    }


    public MovimientoCaja aprobarMovimiento(Long id, Long idAutorizador) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'aprobarMovimiento'");
    }

    public List<MovimientoCaja> obtenerMovimientosPorCajaIdYFechas(Long idCaja, LocalDateTime fechaInicio,
            LocalDateTime fechaFin) {
        return movimientoRepository.findByCajaIdAndFechaBetween(idCaja, fechaInicio, fechaFin);
    }

    public List<MovimientoCaja> obtenerMovimientosPorCorteCajaId(Long corteCajaId) {
        return movimientoRepository.findByCorteCajaId(corteCajaId);
    }
    
}

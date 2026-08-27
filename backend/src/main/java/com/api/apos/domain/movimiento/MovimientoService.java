package com.api.apos.domain.movimiento;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;

    public Movimiento save(Movimiento movimiento) {
        return movimientoRepository.save(movimiento);
    }

    public Movimiento findMovimientoById(Long id) {
        return movimientoRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIMIENTO_NO_ENCONTRADO));
    }
    
    public void deleteMovimiento(Long id) {
        Movimiento movimiento = findMovimientoById(id);
        movimiento.delete();
        movimientoRepository.save(movimiento);
    }   

    public List<Movimiento> findMovimientosByCuentaId(Long cuentaId) {
        return movimientoRepository.findByCuentaId(cuentaId);
    }
}

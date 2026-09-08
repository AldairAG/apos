package com.api.apos.domain.financiero.movimiento;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.enums.CategoriaMovimiento;
import com.api.apos.enums.TipoMovimiento;
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
        return movimientoRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIMIENTO_NO_ENCONTRADO));
    }

    public void deleteMovimiento(Long id) {
        Movimiento movimiento = findMovimientoById(id);
        movimiento.delete();
        movimientoRepository.save(movimiento);
    }

    public List<Movimiento> findMovimientosByCuentaId(Long cuentaId) {
        return movimientoRepository.findByCuentaId(cuentaId);
    }

    public BigDecimal getTotalPorTipo(Long corteCajaId, TipoMovimiento tipoMovimiento) {
        List<Movimiento> movimientos = movimientoRepository.findByCorteCajaIdAndTipo(corteCajaId, tipoMovimiento);
        return movimientos.stream()
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalVentasByCorteCajaId(Long corteCajaId) {
        List<Movimiento> movimientos = movimientoRepository.findByCorteCajaIdAndCategoria(corteCajaId,
                CategoriaMovimiento.VENTA);
        return movimientos.stream()
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalGastosByCorteCajaId(Long corteCajaId) {
        List<Movimiento> gastos = movimientoRepository.findByCorteCajaIdAndCategoriaNot(
                corteCajaId,
                CategoriaMovimiento.VENTA
        );

        return gastos.stream()
                .map(Movimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}

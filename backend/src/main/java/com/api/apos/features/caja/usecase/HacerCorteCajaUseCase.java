package com.api.apos.features.caja.usecase;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.List;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.domain.caja.corte.service.CorteCajaService;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.service.MovimientoCajaService;
import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoConceptoMovimiento;
import com.api.apos.enums.TipoMovimientoCaja;

@Service
@AllArgsConstructor
public class HacerCorteCajaUseCase {
    private final CajaService cajaService;

    private final CorteCajaService corteCajaService;

    private final MovimientoCajaService movimientoCajaService;

    public CorteCaja execute(Long cajaId) {
        Caja caja = cajaService.obtenerCajaPorId(cajaId);

        CorteCaja corteCaja = corteCajaService.obtenerCorteCajaPorId(caja.getCorteActualId());

        List<MovimientoCaja> movimientosEnCorte = movimientoCajaService.obtenerMovimientosPorCajaIdYFechas(
                cajaId,
                corteCaja.getFechaInicio(),
                corteCaja.getFechaFin());

        // Calcular monto final
        corteCaja.setMontoFinal(calcularMontoFinal(movimientosEnCorte));
        // Calcular efectivo real
        corteCaja.setEfectivoReal(calcularEfectivoReal(movimientosEnCorte));
        // Calcular pagos en tarjeta
        corteCaja.setTarjetas(calcularPagosEnTarjeta(movimientosEnCorte));
        // Calcular pagos en transferencias
        corteCaja.setTransferencias(calcularPagosEnTransferencias(movimientosEnCorte));
        // Calcular total de ventas
        corteCaja.setTotalVentas(calcularTotalVentas(movimientosEnCorte));
        // Calcular total de gastos
        corteCaja.setTotalGastos(calcularTotalGastos(movimientosEnCorte));

        corteCaja.setNumeroOrdenes(movimientosEnCorte.stream()
                .filter(movimiento -> movimiento.getConceptoMovimiento() == TipoConceptoMovimiento.VENTA)
                .collect(Collectors.toList()).size());

        corteCaja.setCerrado(true);

        corteCaja.setUpdatedAt(LocalDateTime.now());

        return corteCaja;
    }

    private BigDecimal calcularMontoFinal(List<MovimientoCaja> movimientos) {
        return movimientos.stream()
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularEfectivoReal(List<MovimientoCaja> movimientos) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getMetodoPago() == MetodoPago.EFECTIVO)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularPagosEnTarjeta(List<MovimientoCaja> movimientos) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getMetodoPago() == MetodoPago.TARJETA_DEBITO)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularPagosEnTransferencias(List<MovimientoCaja> movimientos) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getMetodoPago() == MetodoPago.TRANSFERENCIA_BANCARIA)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularTotalVentas(List<MovimientoCaja> movimientos) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getConceptoMovimiento() == TipoConceptoMovimiento.VENTA)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularTotalGastos(List<MovimientoCaja> movimientos) {
        return movimientos.stream()
                .filter(movimiento -> movimiento.getTipoMovimiento() == TipoMovimientoCaja.EGRESO)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
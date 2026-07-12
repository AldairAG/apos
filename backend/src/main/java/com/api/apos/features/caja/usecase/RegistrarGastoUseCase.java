package com.api.apos.features.caja.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.mapper.MovimientoMapper;
import com.api.apos.domain.caja.movimeinto.service.MovimientoCajaService;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RegistrarGastoUseCase {

    private final MovimientoCajaService movimientoCajaService;

    private final CajaService cajaService;

    public MovimientoCajaDTO registrarGastoUseCase(MovimientoCajaDTO movimiento) {

        MovimientoCaja movimientoCaja = MovimientoCaja.builder()
                .caja(cajaService.obtenerCajaPorId(movimiento.getCajaId()))
                .tipoMovimiento(movimiento.getTipoMovimiento())
                .monto(movimiento.getMonto())
                .metodoPago(movimiento.getMetodoPago())
                .conceptoMovimiento(movimiento.getConceptoMovimiento())
                .concepto(movimiento.getConcepto())
                .referencia(movimiento.getReferencia())
                .fecha(LocalDateTime.now())
                .aprobado(false)
                .createdAt(LocalDateTime.now())
                .createdBy(movimiento.getEmpleadoId())
                .build();

        MovimientoCaja nuevoMovimiento = movimientoCajaService.registrarMovimiento(movimientoCaja);
        return MovimientoMapper.toDTO(nuevoMovimiento);
    }

}

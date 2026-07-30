package com.api.apos.features.pos.useCase;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.MovimientoCajaService;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoConceptoMovimiento;
import com.api.apos.enums.TipoMovimientoCaja;
import com.api.apos.features.pos.dto.OrdenResponseDTO;
import com.api.apos.features.pos.dto.PagarOrdenDTO;
import com.api.apos.features.pos.mapper.PosMapper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CobrarOrdenUseCase {

    private OrdenService ordenService;

    private CajaService cajaService;

    private MovimientoCajaService movimientoCajaService;

    @Transactional
    public OrdenResponseDTO execute(PagarOrdenDTO pagarOrdenDTO) {

        // Obtener la orden por
        Orden orden = ordenService.obtenerOrdenPorId(pagarOrdenDTO.getOrdenId())
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (orden.getEstado() != EstadoOrden.LISTA && orden.getEstado() != EstadoOrden.ENTREGADA) {
            throw new RuntimeException("La orden no está en estado LISTA o ENTREGADA");
        }

        Caja caja = cajaService.obtenerCajaPorId(pagarOrdenDTO.getCajaId());

        // Recorrer los pagos y registrar los movimientos en la caja
        for (PagarOrdenDTO.PagoDto pago : pagarOrdenDTO.getPagos()) {
            // Lógica para registrar el movimiento de caja según el método de pago
            registrarCobro(orden, caja, pago, MetodoPago.valueOf(pago.getMetodoPago().name()));
        }

        return PosMapper.mapOrdenToResponseDTO(orden);
    }

    private void registrarCobro(Orden orden, Caja caja, PagarOrdenDTO.PagoDto pago, MetodoPago metodoPago) {
        LocalDateTime ahora = LocalDateTime.now();

        if (metodoPago == MetodoPago.EFECTIVO) {
            cajaService.modificarSaldo(caja.getId(), orden.getTotal());
        }

        BigDecimal montoMovimiento = metodoPago == MetodoPago.GRATIS
                ? BigDecimal.ZERO
                : pago.getMonto();

        MovimientoCaja movimientoCaja = MovimientoCaja.builder()
                .caja(caja)
                .monto(montoMovimiento)
                .tipoMovimiento(TipoMovimientoCaja.INGRESO)
                .conceptoMovimiento(TipoConceptoMovimiento.VENTA)
                .metodoPago(metodoPago)
                .fecha(ahora)
                .createdAt(ahora)
                .createdBy(orden.getEmpleado().getId())
                .build();

        movimientoCajaService.registrarMovimiento(movimientoCaja);
    }

}

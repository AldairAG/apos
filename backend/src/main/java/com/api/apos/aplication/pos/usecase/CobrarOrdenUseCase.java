package com.api.apos.aplication.pos.usecase;

import com.api.apos.domain.pos.venta.VentaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.pos.dto.PagarVentaDto;
import com.api.apos.aplication.tesoreria.movimiento.dto.MovimientoDto;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;
import com.api.apos.domain.financiero.corte_caja.CorteCajaService;
import com.api.apos.domain.financiero.cuenta.Cuenta;
import com.api.apos.domain.financiero.cuenta.CuentaService;
import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.domain.pos.orden.Orden;
import com.api.apos.domain.pos.orden.OrdenService;
import com.api.apos.domain.pos.venta.Venta;
import com.api.apos.enums.EstadoCaja;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoCuenta;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CobrarOrdenUseCase {

    private final OrdenService ordenService;

    private final CorteCajaService corteCajaService;

    private final CuentaService cuentaService;

    private final VentaService ventaService;

    @Transactional
    public void execute(PagarVentaDto pagarVentaDto) {

        // 1. Obtener orden
        Orden orden = ordenService.findById(
                pagarVentaDto.getOrdenId());

        // 2. Validar que la orden pueda pagarse
        if (orden.getEstado() != EstadoOrden.ENTREGADA) {
            throw new AppException(ErrorCode.ORDEN_NO_ENCONTRADA);
        }

        // 3. Obtener corte de caja
        CorteCaja corteCaja = corteCajaService.findById(
                pagarVentaDto.getCorteCajaId());

        // 4. Validar corte
        if (!corteCaja.getEstado().equals(EstadoCaja.ABIERTA)) {
            throw new AppException(ErrorCode.ERROR_CORTE_NO_ABIERTO);
        }

        // 5. Crear venta
        Venta venta = Venta.builder()
                .orden(orden)
                .impuestos(orden.getImpuestos())
                .total(orden.getTotal())
                .build();

        // 6. Crear movimientos
        for (MovimientoDto movimientoDto : pagarVentaDto.getMovimientos()) {

            Movimiento movimiento = Movimiento.builder()
                    .descripcion(movimientoDto.getDescripcion())
                    .monto(movimientoDto.getMonto())
                    .venta(venta)
                    .corteCaja(corteCaja)
                    .build();

            Cuenta cuenta;

            if (movimientoDto.getMetodoDePago() == MetodoPago.DIGITAL) {

                cuenta = cuentaService
                        .findByCuentaDestinoAndTipoAndEmpresaId(
                                TipoCuenta.DIGITAL,
                                orden.getSucursal().getEmpresa().getId());

                cuenta.aumentarSaldo(movimientoDto.getMonto());

                movimiento.setCuenta(cuenta);

                corteCaja.addVentaDigital(movimiento);

            } else {

                corteCaja.addVenta(movimiento);
            }

            venta.addMovimiento(movimiento);
        }

        // 7. Marcar orden como pagada/cerrada
        orden.avanzarEstadoOrden();

        // 8. Guardar venta
        ventaService.save(venta);

        // 9. Guardar cambios
        corteCajaService.save(corteCaja);
        ordenService.save(orden);
    }

}

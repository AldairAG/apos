package com.api.apos.aplication.caja.usecase;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.financiero.caja.CajaService;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;
import com.api.apos.domain.financiero.corte_caja.CorteCajaService;
import com.api.apos.domain.financiero.movimiento.MovimientoService;
import com.api.apos.enums.EstadoCaja;
import com.api.apos.enums.TipoMovimiento;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class CerrarCajaUseCase {

    private final CajaService cajaService;

    private final CorteCajaService corteCajaService;

    private final MovimientoService movimientoService;

    @Transactional 
    public void execute(Long cajaId) {

        Caja caja = cajaService.findById(cajaId);

        if(caja.getEstado()==EstadoCaja.CERRADA) {
            throw new AppException(ErrorCode.ERROR_AL_CERRAR_CAJA);
        }

        CorteCaja corteActivo = corteCajaService.findCorteActivo(cajaId);

        BigDecimal totalIngresos = movimientoService.getTotalPorTipo(corteActivo.getId(), TipoMovimiento.INGRESO);
        BigDecimal totalEgresos = movimientoService.getTotalPorTipo(corteActivo.getId(), TipoMovimiento.EGRESO);

        BigDecimal saldoFinal = totalIngresos.subtract(totalEgresos);

        BigDecimal totalVentas = movimientoService.getTotalVentasByCorteCajaId(corteActivo.getId());

        BigDecimal totalGastos = movimientoService.getTotalGastosByCorteCajaId(corteActivo.getId());

        corteActivo.setIngresos(totalIngresos);
        corteActivo.setEgresos(totalEgresos);
        corteActivo.setSaldoFinal(saldoFinal);
        corteActivo.setVentas(totalVentas);
        corteActivo.setGastos(totalGastos);

        corteActivo.cerrar();
        corteCajaService.save(corteActivo);
    }



}

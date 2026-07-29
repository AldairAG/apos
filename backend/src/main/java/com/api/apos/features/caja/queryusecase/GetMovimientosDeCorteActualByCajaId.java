package com.api.apos.features.caja.queryusecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.domain.caja.corte.CorteCaja;
import com.api.apos.domain.caja.corte.service.CorteCajaService;
import com.api.apos.domain.caja.movimeinto.mapper.MovimientoMapper;
import com.api.apos.domain.caja.movimeinto.service.MovimientoCajaService;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class GetMovimientosDeCorteActualByCajaId {
    
    private final CajaService cajaService;

    private final MovimientoCajaService movimientoCajaService;

    private final CorteCajaService corteCajaService;

    public List<MovimientoCajaDTO> execute(Long cajaId) {
        Caja caja = cajaService.obtenerCajaPorId(cajaId);

        if(caja.getCorteActualId() == null) {
            throw new RuntimeException("La caja no tiene un corte actual");
        }

        CorteCaja corteActual = corteCajaService.obtenerCorteCajaPorId(caja.getCorteActualId());

        return movimientoCajaService.obtenerMovimientosPorCajaIdYFechas(
            cajaId,
            corteActual.getFechaInicio(),
            corteActual.getFechaFin()
        ).stream().map(MovimientoMapper::toDTO).toList();
    }

}

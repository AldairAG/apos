package com.api.apos.features.caja.queryusecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.domain.caja.movimeinto.MovimientoCaja;
import com.api.apos.domain.caja.movimeinto.MovimientoCajaService;
import com.api.apos.domain.caja.movimeinto.mapper.MovimientoMapper;
import com.api.apos.features.caja.dto.MovimientoCajaDTO;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class GetMovimientosDeCorteActualByCajaId {
    
    private final CajaService cajaService;

    private final MovimientoCajaService movimientoCajaService;


    public List<MovimientoCajaDTO> execute(Long cajaId) {
        Caja caja = cajaService.obtenerCajaPorId(cajaId);

        if(caja.getCorteActualId() == null) {
            throw new RuntimeException("La caja no tiene un corte actual");
        }

            List<MovimientoCaja> movimientos = movimientoCajaService.obtenerMovimientosPorCorteCajaId(caja.getCorteActualId());

        return movimientos.stream().map(MovimientoMapper::toDTO).toList();  
    }

}

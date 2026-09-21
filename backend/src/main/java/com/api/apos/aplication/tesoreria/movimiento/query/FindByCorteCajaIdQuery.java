package com.api.apos.aplication.tesoreria.movimiento.query;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.tesoreria.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.tesoreria.movimiento.mapper.MovimientoMapper;
import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.domain.financiero.movimiento.MovimientoService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindByCorteCajaIdQuery {

    private final MovimientoService movimientoService;

    public List<MovimientoDto> execute(Long corteCajaId) {
        
        List<Movimiento> movimientos = movimientoService.findByCorteCajaId(corteCajaId);

        return movimientos.stream().map(MovimientoMapper::toDto).toList();
    }

}

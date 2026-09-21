package com.api.apos.aplication.tesoreria.caja.mapper;

import com.api.apos.aplication.tesoreria.caja.dto.CorteCajaDto;
import com.api.apos.aplication.tesoreria.movimiento.mapper.MovimientoMapper;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;

public class CorteCajaMapper {
    
    public static CorteCajaDto toDto(CorteCaja corteCaja){
        CorteCajaDto corteCajaDto=CorteCajaDto.builder()
            .id(corteCaja.getId())
            .cerradoAt(corteCaja.getCerradoAt())
            .gastos(corteCaja.getGastos())
            .ingresos(corteCaja.getIngresos())
            .movimientos(corteCaja.getMovimientos().stream().map(MovimientoMapper::toDto).toList())
            .saldoFinal(corteCaja.getSaldoFinal())
            .saldoInicial(corteCaja.getSaldoInicial())
            .ventas(corteCaja.getVentas())
            .estado(corteCaja.getEstado())
            .egresos(corteCaja.getEgresos())
            .fecha(corteCaja.getCerradoAt())
            .build();

        return corteCajaDto;

        
    }

}

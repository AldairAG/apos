package com.api.apos.aplication.tesoreria.caja.query;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.tesoreria.caja.dto.CorteCajaDto;
import com.api.apos.aplication.tesoreria.caja.mapper.CorteCajaMapper;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;
import com.api.apos.domain.financiero.corte_caja.CorteCajaService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindCorteCajaActualByCajaId {
    
    private CorteCajaService corteCajaService;

    public CorteCajaDto execute(Long cajaId){

        CorteCaja corteActual=corteCajaService.findCorteActivo(cajaId);

        return CorteCajaMapper.toDto(corteActual);

    }

}

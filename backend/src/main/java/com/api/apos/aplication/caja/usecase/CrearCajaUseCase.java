package com.api.apos.aplication.caja.usecase;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.caja.dto.CajaDto;
import com.api.apos.aplication.caja.mapper.CajaMapper;
import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.financiero.caja.CajaService;
import com.api.apos.enums.EstadoCaja;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CrearCajaUseCase {
    
    private final CajaService cajaService;

    public CajaDto execute(CajaDto cajaDto) {

        BigDecimal saldoInicial = cajaDto.getSaldoInicial() != null ? cajaDto.getSaldoInicial() : BigDecimal.ZERO;

        Caja caja=Caja.builder()
        .activa(true)
        .estado(EstadoCaja.CERRADA)
        .nombre(cajaDto.getNombre())
        .saldo(saldoInicial)
        .saldoInicial(saldoInicial)
        .build();

        return CajaMapper.toDto(cajaService.save(caja));

    }


}

package com.api.apos.aplication.caja.query;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.caja.dto.CajaDto;
import com.api.apos.aplication.caja.mapper.CajaMapper;
import com.api.apos.domain.financiero.caja.CajaService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindCajaBySucursalId {

    private final CajaService cajaService;

    public List<CajaDto> execute(Long sucursalId) {
        return cajaService.findBySucursalId(sucursalId)
                .stream()
                .map(CajaMapper::toDto)
                .toList();
    }

}

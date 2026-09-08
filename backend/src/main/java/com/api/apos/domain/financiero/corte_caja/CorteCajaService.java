package com.api.apos.domain.financiero.corte_caja;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.enums.EstadoCaja;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CorteCajaService {
    
    private final CorteCajaRepository corteCajaRepository;

    public CorteCaja save(CorteCaja corteCaja) {
        return corteCajaRepository.save(corteCaja);
    }

    public CorteCaja findById(Long id) {
        return corteCajaRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.CORTE_CAJA_NO_ENCONTRADO));
    }

    public List<CorteCaja> findByCajaId(Long cajaId) {
        return corteCajaRepository.findByCajaId(cajaId);
    }

    public Boolean existCorteActivo(Long cajaId) {
        return corteCajaRepository.existsByCajaIdAndEstado(cajaId, EstadoCaja.ABIERTA);
    }

    public CorteCaja findCorteActivo(Long cajaId) {
        return corteCajaRepository.findByCajaIdAndEstado(cajaId, EstadoCaja.ABIERTA)
            .orElseThrow(() -> new AppException(ErrorCode.CORTE_CAJA_NO_ENCONTRADO));
    }

}

package com.api.apos.domain.financiero.caja;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;


@Service
@AllArgsConstructor 
public class CajaService {
    
    private final CajaRepository cajaRepository;

    public Caja save(Caja caja) {
        return cajaRepository.save(caja);
    }

    public Caja findById(Long id) {
        return cajaRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CAJA_NO_ENCONTRADA));
    }

    public void delete(Long id) {
        Caja caja = findById(id);

        caja.delete();

        cajaRepository.save(caja);
    }

    public List<Caja> findCajasBySucursalId(Long sucursalId) {
        return cajaRepository.findBySucursalId(sucursalId);
    }



}

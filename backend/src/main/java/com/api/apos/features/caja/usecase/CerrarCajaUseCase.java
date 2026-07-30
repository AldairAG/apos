package com.api.apos.features.caja.usecase;

import org.springframework.stereotype.Service;
import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaService;
import com.api.apos.enums.EstadoCaja;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CerrarCajaUseCase {
    private final CajaService cajaService;

    public Caja execute(Long cajaId) {
        Caja caja = cajaService.obtenerCajaPorId(cajaId);
        caja.setEstado(EstadoCaja.CERRADA);
        caja.setCorteActualId(null);
        caja.getMontoActual();
        caja.setUpdatedAt(java.time.LocalDateTime.now());

        return cajaService.actualizarCaja(caja.getId(),caja);
    }

}

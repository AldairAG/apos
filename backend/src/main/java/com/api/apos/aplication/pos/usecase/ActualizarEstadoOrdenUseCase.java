package com.api.apos.aplication.pos.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.domain.pos.orden.OrdenService;

import lombok.AllArgsConstructor;

@AllArgsConstructor 
@Service 
public class ActualizarEstadoOrdenUseCase {

    private final OrdenService ordenService;

    public void execute(Long ordenId) {
        ordenService.findById(ordenId).avanzarEstadoOrden();
    }

}

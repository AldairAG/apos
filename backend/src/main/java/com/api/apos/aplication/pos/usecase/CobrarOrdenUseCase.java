package com.api.apos.aplication.pos.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.domain.pos.orden.Orden;
import com.api.apos.domain.pos.orden.OrdenService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CobrarOrdenUseCase {

    private final OrdenService ordenService;

    public void execute(Long ordenId) {
        //Obtener orden
        Orden orden = ordenService.findById(ordenId);

        //Generar venta


        //Generar movimiento
    }
    
}

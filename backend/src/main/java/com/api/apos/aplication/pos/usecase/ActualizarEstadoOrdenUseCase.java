package com.api.apos.aplication.pos.usecase;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.aplication.pos.mapper.PosMapper;
import com.api.apos.domain.pos.orden.Orden;
import com.api.apos.domain.pos.orden.OrdenService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@AllArgsConstructor 
@Service 
public class ActualizarEstadoOrdenUseCase {

    private final OrdenService ordenService;

    @Transactional 
    public OrdenDto execute(Long ordenId) {

        Orden orden = ordenService.findById(ordenId);

        orden.avanzarEstadoOrden();
        
        return PosMapper.mapToOrdenDto(orden); 
    }

}

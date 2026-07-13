package com.api.apos.features.pos.useCase;

import org.springframework.stereotype.Service;

import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.domain.caja.movimeinto.service.MovimientoCajaService;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.service.OrdenService;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.features.pos.dto.OrdenResponseDTO;
import com.api.apos.features.pos.mapper.PosMapper;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CobrarOrdenUseCase {
    
    private OrdenService ordenService;

    private CajaService cajaService;

    private MovimientoCajaService movimientoCajaService;
    

    public OrdenResponseDTO cobrarOrdenUseCase(Long ordenId,Long cajaId) {

        //Obtener la orden por 
        Orden orden = ordenService.obtenerOrdenPorId(ordenId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (orden.getEstado() != EstadoOrden.LISTA && orden.getEstado() != EstadoOrden.ENTREGADA) {
            throw new RuntimeException("La orden no está en estado LISTA o ENTREGADA");   
        }

        //Modificar el saldo en caja 
        cajaService.modificarSaldo(cajaId, orden.getTotal());

        // Lógica para registrar el movimiento de caja

        orden = ordenService.actualizarOrden(ordenId,orden);

        return PosMapper.mapOrdenToResponseDTO(orden);
    }

}

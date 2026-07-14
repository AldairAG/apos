package com.api.apos.features.cocina;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.features.pos.dto.OrdenResponseDTO;
import com.api.apos.features.pos.mapper.PosMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CocinaWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notificarOrdenCreada(Orden orden) {

        OrdenResponseDTO dto = PosMapper.mapOrdenToResponseDTO(orden);

        messagingTemplate.convertAndSend(
                "/topic/cocina/" + orden.getSucursal().getId(),
                dto);
    }
}
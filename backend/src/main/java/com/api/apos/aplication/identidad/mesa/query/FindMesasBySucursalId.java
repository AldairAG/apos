package com.api.apos.aplication.identidad.mesa.query;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.identidad.mesa.dto.MesaDto;
import com.api.apos.aplication.identidad.mesa.mapper.MesaMapper;
import com.api.apos.domain.pos.mesa.MesaService;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindMesasBySucursalId {
    
    private final MesaService mesaService;

    public List<MesaDto> execute(Long sucursalId) {
        return mesaService.findBySucursalId(sucursalId)
                          .stream()
                          .map(MesaMapper::toDto)
                          .toList();
    }
}

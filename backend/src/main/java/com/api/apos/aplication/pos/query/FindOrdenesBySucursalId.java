package com.api.apos.aplication.pos.query;

import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import com.api.apos.aplication.pos.dto.OrdenDto;
import com.api.apos.aplication.pos.mapper.PosMapper;
import com.api.apos.domain.pos.orden.OrdenService;

@Service
@AllArgsConstructor
public class FindOrdenesBySucursalId {

    private final OrdenService ordenService;

    public List<OrdenDto> execute(Long sucursalId) {
        return ordenService.findBySucursalId(sucursalId)
                .stream()
                .map(PosMapper::mapToOrdenDto)
                .collect(Collectors.toList());
    }
    
}

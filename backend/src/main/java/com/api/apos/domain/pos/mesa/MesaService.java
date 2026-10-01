package com.api.apos.domain.pos.mesa;

import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import java.util.List;

@Service 
@AllArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;
    
    public Mesa save(Mesa mesa) {
        return mesaRepository.save(mesa);
    }

    public Mesa findById(Long id) {
        return mesaRepository.findById(id).orElse(null);
    }

    public List<Mesa> findBySucursalId(Long sucursalId) {
        return mesaRepository.findBySucursalId(sucursalId);
    }

}

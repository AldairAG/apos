package com.api.apos.domain.pos.orden;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class OrdenService {

    private final OrdenRepository ordenRepository;

    public Orden save(Orden orden) {
        return ordenRepository.save(orden);
    }

    public Orden findById(long id) {
        return ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encotrada"));
    }

    public List<Orden> findBySucursalId(Long sucursalId) {
        return ordenRepository.findBySucursalId(sucursalId);
    }

}

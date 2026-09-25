package com.api.apos.domain.catalogo.modificadores;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
    
@AllArgsConstructor 
@Service 
public class OpcionService {
    
    private final OpcionRepository opcionRepository;

    public Opcion save(Opcion opcion) {
        return opcionRepository.save(opcion);
    }

    public Opcion findById(Long id) {
        return opcionRepository.findById(id).orElse(null);
    }

    public List<Opcion> findAllByIds(List<Long> ids) {
        return opcionRepository.findAllById(ids);
    }

    

}

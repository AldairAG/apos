package com.api.apos.domain.inventario.existencia;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class ExistenciaService {
    
    private final ExistenciaRepository existenciaRepository;

    public Existencia save(Existencia existencia) {
        return existenciaRepository.save(existencia);
    }

    public Existencia findById(Long id) {
        return existenciaRepository.findById(id).orElse(null);
    }

}

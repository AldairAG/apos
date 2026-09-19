package com.api.apos.domain.catalogo.complemento;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class ModificadorService {
    
    private final ModificadorRepository grupoModificadorRepository;

    public Modificador save(Modificador modificador) {
        return grupoModificadorRepository.save(modificador);
    }

    public Modificador findById(Long id) {
        return grupoModificadorRepository.findById(id).orElse(null);
    }

}

package com.api.apos.domain.catalogo.complemento;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class GrupoModificadorService {
    
    private final GrupoModificadorRepository grupoModificadorRepository;

    public GrupoModificador save(GrupoModificador grupoModificador) {
        return grupoModificadorRepository.save(grupoModificador);
    }

    public GrupoModificador findById(Long id) {
        return grupoModificadorRepository.findById(id).orElse(null);
    }

}

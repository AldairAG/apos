package com.api.apos.domain.catalogo.complemento;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class ModificadorService {
    
    private final ModificadorRepository modificadorRepository;

    public Modificador save(Modificador modificador) {
        return modificadorRepository.save(modificador);
    }

    public Modificador findById(Long id) {
        return modificadorRepository.findById(id).orElse(null);
    }

    public List<Modificador> findByEmpresaId(long empresaId){
        return modificadorRepository.findByEmpresaId(empresaId);
    }

    public List<Modificador> findByIds(List<Long> ids){
        return modificadorRepository.findAllById(ids);
    }

}

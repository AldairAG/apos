package com.api.apos.domain.empresa;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public Empresa save(Empresa empresa){
        return empresaRepository.save(empresa);
    }

    public Empresa edit(Empresa empresa){
        return empresaRepository.save(empresa)
    }

    public void delete(Long id){

    }

    public Empresa findById(Long id){
        Empresa empresa= empresaRepository.findById(id)
        .orElseThrow()
    }
    
}

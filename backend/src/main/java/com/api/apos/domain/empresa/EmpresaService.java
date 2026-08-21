package com.api.apos.domain.empresa;
import org.springframework.stereotype.Service;

import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public Empresa save(Empresa empresa){
        return empresaRepository.save(empresa);
    }

    public Empresa edit(Empresa empresa){
        return empresaRepository.save(empresa);
    }

    public void delete(Long id){
        Empresa empresa = findById(id);
        empresa.delete();
        empresaRepository.save(empresa);
    }

    public Empresa findById(Long id){
        Empresa empresa = empresaRepository.findById(id)
        .orElseThrow(() -> new AppException(ErrorCode.EMPRESA_NO_ENCONTRADA));

        return empresa;
    }
    
}

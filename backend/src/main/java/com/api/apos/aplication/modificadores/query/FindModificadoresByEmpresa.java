package com.api.apos.aplication.modificadores.query;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorRepository;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class FindModificadoresByEmpresa {

    private final ModificadorRepository modificadorRepository;

    public List<Modificador> execute(){
         
    }

}

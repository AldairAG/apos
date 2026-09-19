package com.api.apos.aplication.modificadores.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.modificadores.dto.ModifcadorDto;
import com.api.apos.aplication.modificadores.mapper.OpcionMapper;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.catalogo.modificadores.Opcion;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearModificadorUseCase {

    private ModificadorService modificadorService;

    public void execute(ModifcadorDto modifcadorDto){

        List<Opcion> opciones = modifcadorDto.getOpciones().stream()
            .map(OpcionMapper::toEntity).toList();

        Modificador modficador = Modificador.builder()
            .nombre(modifcadorDto.getNombre())
            .build();

        modficador.addOpciones(opciones);

        modificadorService.save(modficador);

    }

}

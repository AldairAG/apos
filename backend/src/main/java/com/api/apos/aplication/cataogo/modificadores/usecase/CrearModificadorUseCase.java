package com.api.apos.aplication.cataogo.modificadores.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cataogo.modificadores.dto.ModificadorDto;
import com.api.apos.aplication.cataogo.modificadores.mapper.ModificadorMapper;
import com.api.apos.aplication.cataogo.modificadores.mapper.OpcionMapper;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.catalogo.complemento.ModificadorService;
import com.api.apos.domain.catalogo.modificadores.Opcion;
import com.api.apos.domain.organizacion.empresa.Empresa;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearModificadorUseCase {

    private ModificadorService modificadorService;

    private final UsuarioService usuarioService;

    public ModificadorDto execute(ModificadorDto modifcadorDto){

        Empresa empresa = usuarioService.getUsuarioAutenticado().getEmpresa();

        List<Opcion> opciones = modifcadorDto.getOpciones().stream()
            .map(OpcionMapper::toEntity).toList();

        Modificador modficador = Modificador.builder()
            .nombre(modifcadorDto.getNombre())
            .build();

        modficador.addOpciones(opciones);

        empresa.addModificador(modficador);

        return ModificadorMapper.toDto(modificadorService.save(modficador));

    }

}

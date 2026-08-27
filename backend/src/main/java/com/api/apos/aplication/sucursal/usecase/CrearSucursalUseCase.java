package com.api.apos.aplication.sucursal.usecase;

import java.security.SecureRandom;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.sucursal.dto.SucursalDto;
import com.api.apos.aplication.sucursal.mapper.SucursalMapper;
import com.api.apos.domain.sucursal.SucursalService;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.empresa.Empresa;
import com.api.apos.domain.sucursal.Sucursal;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearSucursalUseCase {

    private final SucursalService sucursalService;

    private final UsuarioService usuarioService;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final int LENGTH = 6;

    private static final SecureRandom RANDOM = new SecureRandom();

    public SucursalDto execute(SucursalDto sucursalDto) {

        Usuario usuario = usuarioService.getUsuarioAutenticado();

        Empresa empresa = usuario.getEmpresa();

        Sucursal sucursal = Sucursal.builder()
                .nombre(sucursalDto.getNombre())
                .codigo(generar())
                .activa(true)
                .direccion(sucursalDto.getDireccion())
                .telefono(sucursalDto.getTelefono())
                .empresa(empresa)
                .build();

        return SucursalMapper.toDto(sucursalService.save(sucursal));

    }

    private String generar() {

        StringBuilder codigo = new StringBuilder(LENGTH);

        for (int i = 0; i < LENGTH; i++) {
            int index = RANDOM.nextInt(CHARACTERS.length());
            codigo.append(CHARACTERS.charAt(index));
        }

        return codigo.toString();
    }

}

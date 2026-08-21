package com.api.apos.aplication.empresa.controller.usecase;

import java.io.IOException;

import org.springframework.stereotype.Service;
import com.api.apos.aplication.empresa.controller.dto.EmpresaDto;
import com.api.apos.aplication.empresa.controller.mapper.EmpresaMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.empresa.Empresa;
import com.api.apos.domain.empresa.EmpresaService;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;
import com.api.apos.helpers.FileStorageService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearEmpresa {

    private final EmpresaService empresaService;

    private final UsuarioService usuarioService;

    private final FileStorageService fileStorageService;

    public EmpresaDto execute(EmpresaDto empresaDto) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();

        String fileName = null;

        try {
            fileName = fileStorageService.storeFile(empresaDto.getImgFile(), usuario.getId(), "LOGO_EMPRESA");
        } catch (IOException e) {
            throw new AppException(ErrorCode.ERROR_ALMACENANDO_ARCHIVO);
        }

        Empresa empresa = Empresa.builder()
                .nombre(empresaDto.getNombre())
                .logoUrl(fileName)
                .build();

        empresa.addUsuario(usuario);

        empresa = empresaService.save(empresa);

        return EmpresaMapper.toDto(empresa);
    }

}

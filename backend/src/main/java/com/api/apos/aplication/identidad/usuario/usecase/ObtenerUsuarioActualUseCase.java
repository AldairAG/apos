package com.api.apos.aplication.identidad.usuario.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.aplication.identidad.empresa.dto.EmpresaDto;
import com.api.apos.aplication.identidad.empresa.mapper.EmpresaMapper;
import com.api.apos.aplication.identidad.usuario.dto.UsuarioDto;
import com.api.apos.aplication.tesoreria.cuenta.dto.CuentaDto;
import com.api.apos.aplication.tesoreria.cuenta.mapper.CuentaMapper;

import java.util.List;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ObtenerUsuarioActualUseCase {
    
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public UsuarioDto execute() {
        Usuario usuario = usuarioService.getUsuarioAutenticado();

        EmpresaDto empresaDto = EmpresaMapper.toDto(usuario.getEmpresa());

        List<CuentaDto> cuentaDto = usuario.getEmpresa().getCuentas()
            .stream()
            .map(CuentaMapper::toDto).toList(); 

        empresaDto.setCuentas(cuentaDto);

        return UsuarioDto.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .telefono(usuario.getTelefono())
                .lada(usuario.getLada())
                .empresa(empresaDto)
                .build();
    }

}

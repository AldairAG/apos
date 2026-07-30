package com.api.apos.domain.sucursal.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioRepository;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class GetSucursalesForColaborador {

    private final SucursalService sucursalService;

    private final UsuarioRepository usuarioRepository;

    public List<Sucursal> execute(Long colaboradorId) {
        if (colaboradorId == null) {
            throw new IllegalArgumentException("El id del colaborador es requerido");
        }

        Usuario colaborador = usuarioRepository.findById(colaboradorId)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));

        return sucursalService.obtenerSucursalesPorIdUsuario(colaborador.getSucursalId());
    }

}

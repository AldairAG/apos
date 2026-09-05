package com.api.apos.aplication.cuenta.query;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.cuenta.dto.CuentaDto;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.cuenta.CuentaService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FindCuentasByUsuarioActual {
    
    private final CuentaService cuentaService;

    private final UsuarioService usuarioService;

    public void execute() {

        Usuario usuarioActual = usuarioService.getUsuarioAutenticado();
        
        
        
    }

}

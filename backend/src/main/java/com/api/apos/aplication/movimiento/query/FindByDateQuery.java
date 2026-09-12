package com.api.apos.aplication.movimiento.query;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.aplication.movimiento.dto.MovimientoDto;
import com.api.apos.aplication.movimiento.mapper.MovimientoMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.financiero.movimiento.MovimientoService;

import lombok.AllArgsConstructor;

@AllArgsConstructor 
@Service 
public class FindByDateQuery {

    private final MovimientoService movimientoService;

    private final UsuarioService usuarioService;
    
    public List<MovimientoDto> execute(String fecha) {
        
        Usuario usuario = usuarioService.getUsuarioAutenticado();

        LocalDateTime fechaLocalDateTime = LocalDateTime.parse(fecha);
        return movimientoService.findMovimientosByEmpresaCuentaIdAndFecha(usuario.getEmpresa().getId(), fechaLocalDateTime.toLocalDate())
                .stream()
                .map(MovimientoMapper::toDto)
                .toList();
        
    }
}

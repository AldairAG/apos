package com.api.apos.domain.sucursal.usecase;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.service.UsuarioService;
import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;
import com.api.apos.enums.EstadoCaja;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearSucursalUseCase {

    private final SucursalService sucursalService;

    private final UsuarioService usuarioService;

    public Sucursal execute(Sucursal sucursal, Long idUsuario) {

        if (sucursal == null) {
            throw new IllegalArgumentException("La sucursal es requerida");
        }

        Usuario usuario = usuarioService.obtenerUsuarioAutenticado();

        if (sucursal.getActiva() == null) {
            sucursal.setActiva(true);
        }

        LocalDateTime now = LocalDateTime.now();
        if (sucursal.getCreatedAt() == null) {
            sucursal.setCreatedAt(now);
        }
        sucursal.setUpdatedAt(now);

        sucursal.setCajas(List.of(crearCajaInicial(sucursal)));

        sucursal.setUsuario(usuario);
        return sucursalService.crearSucursal(sucursal);
    }

    private Caja crearCajaInicial(Sucursal sucursal) {
        Caja caja = new Caja();
        caja.setNombre("Caja Inicial");
        caja.setSucursal(sucursal);
        caja.setMontoActual(null);
        caja.setActiva(true);
        caja.setEstado(EstadoCaja.ABIERTA);
        caja.setCreatedAt(LocalDateTime.now());
        caja.setUpdatedAt(LocalDateTime.now());
        return caja;
    }
}

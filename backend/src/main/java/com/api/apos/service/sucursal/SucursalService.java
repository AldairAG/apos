package com.api.apos.service.sucursal;

import java.util.List;

import com.api.apos.entity.Sucursal;

public interface SucursalService {
    void crearSucursal(Sucursal sucursal);

    void actualizarSucursal(Long id, Sucursal sucursal);

    void eliminarSucursal(Long id);

    void asignarUsuarioASucursal(Long sucursalId, Long usuarioId);

    List<Sucursal> obtenerSucursalesPorPropietario(Long propietarioId);
}

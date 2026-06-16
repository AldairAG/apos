package com.api.apos.domain.sucursal.service;

import java.util.List;

import com.api.apos.domain.sucursal.Sucursal;

public interface SucursalService {
    Sucursal crearSucursal(Sucursal sucursal);
    List<Sucursal> obtenerSucursalesPorIdUsuario(Long idUsuario);
    Sucursal actualizarSucursal(Sucursal sucursal);
    void eliminarSucursal(Long idSucursal);
}

package com.api.apos.service.sucursal;

import com.api.apos.entity.Sucursal;
import java.util.List;
import java.util.Optional;

public interface SucursalService {
    List<Sucursal> findAll();

    Optional<Sucursal> findById(Long id);

    List<Sucursal> findByUsuarioId(Long usuarioId);

    Sucursal save(Sucursal sucursal);

    Sucursal update(Long id, Sucursal sucursal);

    void deleteById(Long id);
}

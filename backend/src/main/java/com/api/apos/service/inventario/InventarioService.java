package com.api.apos.service.inventario;

import com.api.apos.entity.Inventario;
import java.util.List;
import java.util.Optional;

public interface InventarioService {
    List<Inventario> findAll();

    Optional<Inventario> findById(Long id);

    Optional<Inventario> findBySucursalId(Long sucursalId);

    Inventario save(Inventario inventario);

    void deleteById(Long id);
}

package com.api.apos.service.producto;

import com.api.apos.entity.Producto;
import java.util.List;
import java.util.Optional;

public interface ProductoService {
    List<Producto> findAll();

    List<Producto> findActivos();

    Optional<Producto> findById(Long id);

    Producto save(Producto producto);

    Producto update(Long id, Producto producto);

    void deleteById(Long id);
}

package com.api.apos.service.categoriagasto;

import com.api.apos.entity.CategoriaGasto;
import java.util.List;
import java.util.Optional;

public interface CategoriaGastoService {
    List<CategoriaGasto> findAll();

    Optional<CategoriaGasto> findById(Long id);

    CategoriaGasto save(CategoriaGasto categoriaGasto);

    CategoriaGasto update(Long id, CategoriaGasto categoriaGasto);

    void deleteById(Long id);
}

package com.api.apos.service.gasto;

import com.api.apos.entity.Gasto;
import java.util.List;
import java.util.Optional;

public interface GastoService {
    List<Gasto> findAll();

    Optional<Gasto> findById(Long id);

    List<Gasto> findBySucursalId(Long sucursalId);

    Gasto save(Gasto gasto);

    Gasto update(Long id, Gasto gasto);

    void deleteById(Long id);
}

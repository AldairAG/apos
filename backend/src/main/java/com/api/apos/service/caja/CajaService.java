package com.api.apos.service.caja;

import com.api.apos.entity.Caja;
import java.util.List;
import java.util.Optional;

public interface CajaService {
    List<Caja> findAll();

    Optional<Caja> findById(Long id);

    List<Caja> findBySucursalId(Long sucursalId);

    Caja save(Caja caja);

    Caja update(Long id, Caja caja);

    void deleteById(Long id);
}

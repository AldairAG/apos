package com.api.apos.service.salida;

import com.api.apos.entity.Salida;
import java.util.List;
import java.util.Optional;

public interface SalidaService {
    List<Salida> findAll();

    Optional<Salida> findById(Long id);

    List<Salida> findBySucursalId(Long sucursalId);

    Salida save(Salida salida);

    Salida update(Long id, Salida salida);

    void deleteById(Long id);
}

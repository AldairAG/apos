package com.api.apos.service.entrada;

import com.api.apos.entity.Entrada;
import java.util.List;
import java.util.Optional;

public interface EntradaService {
    List<Entrada> findAll();

    Optional<Entrada> findById(Long id);

    List<Entrada> findBySucursalId(Long sucursalId);

    Entrada save(Entrada entrada);

    Entrada update(Long id, Entrada entrada);

    void deleteById(Long id);
}

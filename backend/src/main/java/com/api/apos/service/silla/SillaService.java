package com.api.apos.service.silla;

import com.api.apos.entity.Silla;
import java.util.List;
import java.util.Optional;

public interface SillaService {
    List<Silla> findAll();

    Optional<Silla> findById(Long id);

    List<Silla> findByMesaId(Long mesaId);

    Silla save(Silla silla);

    Silla update(Long id, Silla silla);

    void deleteById(Long id);
}

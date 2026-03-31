package com.api.apos.service.receta;

import com.api.apos.entity.Receta;
import java.util.List;
import java.util.Optional;

public interface RecetaService {
    List<Receta> findAll();
    Optional<Receta> findById(Long id);
    Receta save(Receta receta);
    Receta update(Long id, Receta receta);
    void deleteById(Long id);
}

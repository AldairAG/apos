package com.api.apos.service.recetamaterial;

import com.api.apos.entity.RecetaMaterial;
import java.util.List;
import java.util.Optional;

public interface RecetaMaterialService {
    List<RecetaMaterial> findAll();
    Optional<RecetaMaterial> findById(Long id);
    List<RecetaMaterial> findByRecetaId(Long recetaId);
    RecetaMaterial save(RecetaMaterial recetaMaterial);
    RecetaMaterial update(Long id, RecetaMaterial recetaMaterial);
    void deleteById(Long id);
}

package com.api.apos.service.material;

import com.api.apos.entity.Material;
import java.util.List;
import java.util.Optional;

public interface MaterialService {
    List<Material> findAll();
    Optional<Material> findById(Long id);
    List<Material> findByInventarioId(Long inventarioId);
    Material save(Material material);
    Material update(Long id, Material material);
    void deleteById(Long id);
}

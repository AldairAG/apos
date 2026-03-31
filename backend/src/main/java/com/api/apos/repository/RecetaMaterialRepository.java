package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.RecetaMaterial;
import java.util.List;

public interface RecetaMaterialRepository extends JpaRepository<RecetaMaterial, Long> {
    List<RecetaMaterial> findByRecetaId(Long recetaId);
}

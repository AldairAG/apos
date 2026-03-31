package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Receta;

public interface RecetaRepository extends JpaRepository<Receta, Long> {
}

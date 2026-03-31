package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.Silla;
import java.util.List;

public interface SillaRepository extends JpaRepository<Silla, Long> {
    List<Silla> findByMesaId(Long mesaId);
}

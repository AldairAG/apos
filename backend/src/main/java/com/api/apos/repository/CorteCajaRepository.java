package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.entity.CorteCaja;
import java.util.List;

public interface CorteCajaRepository extends JpaRepository<CorteCaja, Long> {
    List<CorteCaja> findByCajaId(Long cajaId);

    List<CorteCaja> findByUsuarioResponsableId(Long usuarioId);
}

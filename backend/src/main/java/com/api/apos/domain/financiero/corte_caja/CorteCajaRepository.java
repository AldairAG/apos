package com.api.apos.domain.financiero.corte_caja;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.api.apos.enums.EstadoCaja;

public interface CorteCajaRepository extends JpaRepository<CorteCaja, Long> {
    List<CorteCaja> findByCajaId(Long cajaId);

    Boolean existsByCajaIdAndEstado(Long cajaId, EstadoCaja estado);

    Optional<CorteCaja> findByCajaIdAndEstado(Long cajaId, EstadoCaja estado);
}

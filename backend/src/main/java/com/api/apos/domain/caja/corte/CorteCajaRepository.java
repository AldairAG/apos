package com.api.apos.domain.caja.corte;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CorteCajaRepository extends JpaRepository<CorteCaja, Long> {

    Optional<CorteCaja> findFirstByCajaIdAndCerradoFalseOrderByFechaInicioDesc(Long cajaId);

}


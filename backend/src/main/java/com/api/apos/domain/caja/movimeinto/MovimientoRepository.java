package com.api.apos.domain.caja.movimeinto;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoRepository extends JpaRepository<MovimientoCaja, Long> {
    
    List<MovimientoCaja> findByCajaIdAndFechaBetween(Long idCaja, LocalDateTime fechaInicio, LocalDateTime fechaFin);

    List<MovimientoCaja> findByCorteCajaId(Long corteCajaId);
}

package com.api.apos.domain.financiero.caja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    
    List<Caja> findBySucursalId(Long sucursalId);

}

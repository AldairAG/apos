package com.api.apos.domain.financiero.caja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    
    List<Caja> findBySucursalId(Long sucursalId);

    @Query("SELECT c FROM Caja c WHERE c.sucursal.id = :sucursalId AND (c.activa = true OR c.activa IS NULL)")
    List<Caja> findActivasBySucursalId(@Param("sucursalId") Long sucursalId);

}

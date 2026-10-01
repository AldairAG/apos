package com.api.apos.domain.pos.mesa;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    
    List<Mesa> findBySucursalId(Long sucursalId);
}

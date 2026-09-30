package com.api.apos.domain.pos.orden;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenRepository extends JpaRepository<Orden,Long>  {

    List<Orden> findBySucursalId(Long sucursalId);

}

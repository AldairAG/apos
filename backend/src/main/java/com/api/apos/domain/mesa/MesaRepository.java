package com.api.apos.domain.mesa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    List<Mesa> findBySucursal_Id(Long idSucursal);

    
}

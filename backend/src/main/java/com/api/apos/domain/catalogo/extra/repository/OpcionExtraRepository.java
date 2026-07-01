package com.api.apos.domain.catalogo.extra.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.catalogo.extra.entity.OpcionExtra;

public interface OpcionExtraRepository extends JpaRepository<OpcionExtra, Long> {
    
    List<OpcionExtra> findByGrupoExtra_Id(Long grupoExtraId);
    
    List<OpcionExtra> findByGrupoExtra_IdAndActivoTrue(Long grupoExtraId);
}

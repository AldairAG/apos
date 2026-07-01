package com.api.apos.domain.catalogo.receta.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.catalogo.receta.entity.Receta;

import java.util.List;

public interface RecetaRepository extends JpaRepository<Receta, Long> {
    
    List<Receta> findByActivaTrue();

    List<Receta> findByUsuario_Id(Long idUsuario);

}

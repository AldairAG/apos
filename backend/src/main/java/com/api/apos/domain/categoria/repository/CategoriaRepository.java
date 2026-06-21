package com.api.apos.domain.categoria.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.domain.categoria.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    List<Categoria> findByUsuario_IdAndActivoTrue(Long idUsuario);
    
}

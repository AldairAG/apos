package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.api.apos.entity.ProduccionReceta;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProduccionRecetaRepository extends JpaRepository<ProduccionReceta, Long> {
    
    List<ProduccionReceta> findBySucursalId(Long sucursalId);
    
    List<ProduccionReceta> findByRecetaId(Long recetaId);
    
    List<ProduccionReceta> findByUsuarioId(Long usuarioId);
    
    List<ProduccionReceta> findByFechaProduccionBetween(LocalDateTime inicio, LocalDateTime fin);
}

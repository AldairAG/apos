package com.api.apos.domain.catalogo.extra.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.api.apos.domain.catalogo.extra.entity.GrupoExtra;

public interface GrupoExtraRepository extends JpaRepository<GrupoExtra, Long> {
    
    List<GrupoExtra> findByUsuario_Id(Long usuarioId);
    
    List<GrupoExtra> findByUsuario_IdAndActivoTrue(Long usuarioId);
    
    @Query("SELECT DISTINCT ge FROM GrupoExtra ge " +
           "JOIN ProductoGrupoExtra pge ON pge.grupoExtra.id = ge.id " +
           "WHERE pge.producto.id = :productoId")
    List<GrupoExtra> findByProductoId(@Param("productoId") Long productoId);
}

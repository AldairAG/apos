package com.api.apos.domain.orden.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;


public interface OrdenRepository extends JpaRepository<Orden, Long> {
    
    Optional<Orden> findByFolio(String folio);
    
    List<Orden> findBySucursal_Id(Long sucursalId);
    
    List<Orden> findBySucursal_IdAndEstado(Long sucursalId, EstadoOrden estado);
    
    List<Orden> findBySucursal_IdAndTipo(Long sucursalId, TipoOrden tipo);
    
    List<Orden> findByMesa_Id(Long mesaId);
    
    List<Orden> findBySucursal_IdAndFechaBetween(Long sucursalId, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    @Query("SELECT o FROM Orden o WHERE o.sucursal.id = :sucursalId " +
           "AND DATE(o.fecha) = :fecha")
    List<Orden> findOrdenesDelDia(@Param("sucursalId") Long sucursalId, @Param("fecha") LocalDate fecha);
    
    @Query("SELECT o FROM Orden o WHERE o.sucursal.id = :sucursalId " +
           "AND o.estado IN ('PENDIENTE', 'EN_PREPARACION', 'LISTA')")
    List<Orden> findOrdenesAbiertas(@Param("sucursalId") Long sucursalId);
    
    @Query("SELECT o FROM Orden o WHERE o.sucursal.id = :sucursalId " +
           "AND o.estado != 'ENTREGADA' AND o.estado != 'CANCELADA'")
    List<Orden> findOrdenesActivas(@Param("sucursalId") Long sucursalId);
}

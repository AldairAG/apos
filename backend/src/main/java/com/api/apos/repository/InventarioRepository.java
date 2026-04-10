package com.api.apos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.entity.Inventario;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    
}

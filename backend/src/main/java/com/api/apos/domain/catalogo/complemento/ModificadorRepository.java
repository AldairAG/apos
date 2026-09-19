package com.api.apos.domain.catalogo.complemento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModificadorRepository extends JpaRepository<Modificador, Long> {
    
    List<Modificador> findByEmpresaId(long empresaId);

}

package com.api.apos.domain.catalogo.complemento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ModificadorRepository extends JpaRepository<Modificador, Long> {

    List<Modificador> findByEmpresaId(long empresaId);

    @Query("""
                SELECT DISTINCT o.modificador
                FROM Opcion o
                WHERE o.id IN :ids
            """)
    List<Modificador> findModificadoresByOpcionIds(@Param("ids") List<Long> ids);

}

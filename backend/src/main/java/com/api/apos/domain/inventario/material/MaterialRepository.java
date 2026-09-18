package com.api.apos.domain.inventario.material;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    @Query("""
            SELECT m
            FROM Material m
            WHERE m.empresa.id = :empresaId
              AND (
                  :nombre IS NULL
                  OR :nombre = ''
                  OR LOWER(r.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
              )
            """)
    Page<Material> buscarPorEmpresaYNombre(
            @Param("empresaId") Long empresaId,
            @Param("nombre") String nombre,
            Pageable pageable);

}

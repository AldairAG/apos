package com.api.apos.domain.inventario.receta;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecetaRepository extends JpaRepository<Receta, Long> {

    @Query("""
            SELECT r
            FROM Receta r
            WHERE r.empresa.id = :empresaId
              AND (
                  :nombre IS NULL
                  OR :nombre = ''
                  OR LOWER(r.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
              )
            """)
    Page<Receta> buscarPorEmpresaYNombre(
            @Param("empresaId") Long empresaId,
            @Param("nombre") String nombre,
            Pageable pageable);

}

package com.api.apos.domain.catalogo.categoria;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    List<Categoria> findBySucursalId(Long sucursalId);

}

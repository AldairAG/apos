package com.api.apos.domain.catalogo.producto;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findBySucursalId(Long sucursalId);

    List<Producto> findAllByIdInAndSucursalId(
            List<Long> ids,
            Long sucursalId);
}

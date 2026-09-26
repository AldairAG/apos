package com.api.apos.domain.inventario.receta;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RecetaService {

    private final RecetaRepository recetaRepository;

    public Receta save(Receta receta) {
        return recetaRepository.save(receta);
    }

    public Receta findById(Long id) {
        return recetaRepository.findById(id).orElse(null);
    }

    public Page<Receta> findByEmpresaId(Long empresaId, String nombre, Pageable pageable) {
        return recetaRepository.buscarPorEmpresaYNombre(empresaId, nombre, pageable);
    }

    public List<RecetaDetalle> findDetallesByProductoId(Long productoId) {
        return recetaRepository.findDetallesByProductoId(productoId);
    }

}

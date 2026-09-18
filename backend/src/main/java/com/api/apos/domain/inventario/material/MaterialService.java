package com.api.apos.domain.inventario.material;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public Material save(Material material) {
        return materialRepository.save(material);
    }

    public Material findById(Long id) {
        return materialRepository.findById(id).orElse(null);
    }

    public Page<Material> findByEmpresaId(Long empresaId, String nombre, Pageable pageable) {
        return materialRepository.buscarPorEmpresaYNombre(empresaId, nombre, pageable);
    }

}

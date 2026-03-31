package com.api.apos.service.material;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.Material;
import com.api.apos.repository.InventarioRepository;
import com.api.apos.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final InventarioRepository inventarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Material> findAll() {
        return materialRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Material> findById(Long id) {
        return materialRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Material> findByInventarioId(Long inventarioId) {
        return materialRepository.findByInventarioId(inventarioId);
    }

    @Override
    @Transactional
    public Material save(Material material) {
        Inventario inventario = inventarioRepository.findById(material.getInventario().getId())
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));
        material.setInventario(inventario);
        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Material update(Long id, Material data) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado"));
        material.setNombre(data.getNombre());
        material.setCantidad(data.getCantidad());
        material.setUnidadMedida(data.getUnidadMedida());
        material.setTipoMaterial(data.getTipoMaterial());
        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        materialRepository.deleteById(id);
    }
}

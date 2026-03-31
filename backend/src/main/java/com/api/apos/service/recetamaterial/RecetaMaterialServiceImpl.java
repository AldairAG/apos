package com.api.apos.service.recetamaterial;

import com.api.apos.entity.Material;
import com.api.apos.entity.Receta;
import com.api.apos.entity.RecetaMaterial;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.RecetaMaterialRepository;
import com.api.apos.repository.RecetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecetaMaterialServiceImpl implements RecetaMaterialService {

    private final RecetaMaterialRepository recetaMaterialRepository;
    private final RecetaRepository recetaRepository;
    private final MaterialRepository materialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RecetaMaterial> findAll() {
        return recetaMaterialRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RecetaMaterial> findById(Long id) {
        return recetaMaterialRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecetaMaterial> findByRecetaId(Long recetaId) {
        return recetaMaterialRepository.findByRecetaId(recetaId);
    }

    @Override
    @Transactional
    public RecetaMaterial save(RecetaMaterial recetaMaterial) {
        Receta receta = recetaRepository.findById(recetaMaterial.getReceta().getId())
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        Material material = materialRepository.findById(recetaMaterial.getMaterial().getId())
                .orElseThrow(() -> new RuntimeException("Material no encontrado"));
        recetaMaterial.setReceta(receta);
        recetaMaterial.setMaterial(material);
        return recetaMaterialRepository.save(recetaMaterial);
    }

    @Override
    @Transactional
    public RecetaMaterial update(Long id, RecetaMaterial data) {
        RecetaMaterial recetaMaterial = recetaMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RecetaMaterial no encontrado"));
        recetaMaterial.setCantidad(data.getCantidad());
        recetaMaterial.setUnidadMedida(data.getUnidadMedida());
        return recetaMaterialRepository.save(recetaMaterial);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        recetaMaterialRepository.deleteById(id);
    }
}

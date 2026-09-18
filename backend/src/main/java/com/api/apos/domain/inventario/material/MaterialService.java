package com.api.apos.domain.inventario.material;

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
}

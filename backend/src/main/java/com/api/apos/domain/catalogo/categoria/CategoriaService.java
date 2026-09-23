package com.api.apos.domain.catalogo.categoria;

import org.springframework.stereotype.Service;
import java.util.List;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class CategoriaService {
    
    private final CategoriaRepository categoriaRepository;

    public Categoria save(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public Categoria findById(Long id) {
        return categoriaRepository.findById(id).orElse(null);
    }

    public List<Categoria> findBySucursalId(Long sucursalId) {
        return categoriaRepository.findBySucursalId(sucursalId);
    }

}

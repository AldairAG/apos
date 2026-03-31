package com.api.apos.service.receta;

import com.api.apos.entity.Receta;
import com.api.apos.repository.RecetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecetaServiceImpl implements RecetaService {

    private final RecetaRepository recetaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Receta> findAll() {
        return recetaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Receta> findById(Long id) {
        return recetaRepository.findById(id);
    }

    @Override
    @Transactional
    public Receta save(Receta receta) {
        return recetaRepository.save(receta);
    }

    @Override
    @Transactional
    public Receta update(Long id, Receta data) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        receta.setNombre(data.getNombre());
        receta.setDescripcion(data.getDescripcion());
        return recetaRepository.save(receta);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        recetaRepository.deleteById(id);
    }
}

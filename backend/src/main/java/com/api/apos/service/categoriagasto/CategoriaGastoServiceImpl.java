package com.api.apos.service.categoriagasto;

import com.api.apos.entity.CategoriaGasto;
import com.api.apos.repository.CategoriaGastoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoriaGastoServiceImpl implements CategoriaGastoService {

    private final CategoriaGastoRepository categoriaGastoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaGasto> findAll() {
        return categoriaGastoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoriaGasto> findById(Long id) {
        return categoriaGastoRepository.findById(id);
    }

    @Override
    @Transactional
    public CategoriaGasto save(CategoriaGasto categoriaGasto) {
        return categoriaGastoRepository.save(categoriaGasto);
    }

    @Override
    @Transactional
    public CategoriaGasto update(Long id, CategoriaGasto data) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría de gasto no encontrada"));
        categoria.setNombre(data.getNombre());
        categoria.setDescripcion(data.getDescripcion());
        return categoriaGastoRepository.save(categoria);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        categoriaGastoRepository.deleteById(id);
    }
}

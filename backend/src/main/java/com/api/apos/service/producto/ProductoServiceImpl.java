package com.api.apos.service.producto;

import com.api.apos.entity.Producto;
import com.api.apos.entity.Receta;
import com.api.apos.repository.ProductoRepository;
import com.api.apos.repository.RecetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final RecetaRepository recetaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> findActivos() {
        return productoRepository.findByActivoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    @Transactional
    public Producto save(Producto producto) {
        Receta receta = recetaRepository.findById(producto.getReceta().getId())
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        producto.setReceta(receta);
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto update(Long id, Producto data) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setNombre(data.getNombre());
        producto.setPrecio(data.getPrecio());
        producto.setActivo(data.isActivo());
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        productoRepository.deleteById(id);
    }
}

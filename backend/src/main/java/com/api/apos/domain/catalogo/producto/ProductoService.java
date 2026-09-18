package com.api.apos.domain.catalogo.producto;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service 
@AllArgsConstructor 
public class ProductoService {
    
    private final ProductoRepository productoRepository;

    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto findById(Long id) {
        return productoRepository.findById(id).orElse(null);
    }

}

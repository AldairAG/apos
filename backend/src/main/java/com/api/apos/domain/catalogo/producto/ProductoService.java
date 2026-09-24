package com.api.apos.domain.catalogo.producto;

import org.springframework.stereotype.Service;
import java.util.List;

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

    public List<Producto> findBySucursalId(Long sucursalId) {
        return productoRepository.findBySucursalId(sucursalId);
    }

}

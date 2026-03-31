package com.api.apos.service.ordenitem;

import com.api.apos.entity.Orden;
import com.api.apos.entity.OrdenItem;
import com.api.apos.entity.Producto;
import com.api.apos.entity.Silla;
import com.api.apos.repository.OrdenItemRepository;
import com.api.apos.repository.OrdenRepository;
import com.api.apos.repository.ProductoRepository;
import com.api.apos.repository.SillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenItemServiceImpl implements OrdenItemService {

    private final OrdenItemRepository ordenItemRepository;
    private final OrdenRepository ordenRepository;
    private final ProductoRepository productoRepository;
    private final SillaRepository sillaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrdenItem> findAll() {
        return ordenItemRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrdenItem> findById(Long id) {
        return ordenItemRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenItem> findByOrdenId(Long ordenId) {
        return ordenItemRepository.findByOrdenId(ordenId);
    }

    @Override
    @Transactional
    public OrdenItem save(OrdenItem ordenItem) {
        Orden orden = ordenRepository.findById(ordenItem.getOrden().getId())
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        Producto producto = productoRepository.findById(ordenItem.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        ordenItem.setOrden(orden);
        ordenItem.setProducto(producto);
        ordenItem.setPrecioUnitario(producto.getPrecio());

        if (ordenItem.getSilla() != null && ordenItem.getSilla().getId() != null) {
            Silla silla = sillaRepository.findById(ordenItem.getSilla().getId())
                    .orElseThrow(() -> new RuntimeException("Silla no encontrada"));
            ordenItem.setSilla(silla);
        }

        return ordenItemRepository.save(ordenItem);
    }

    @Override
    @Transactional
    public OrdenItem update(Long id, OrdenItem data) {
        OrdenItem ordenItem = ordenItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrdenItem no encontrado"));
        ordenItem.setCantidad(data.getCantidad());
        return ordenItemRepository.save(ordenItem);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        ordenItemRepository.deleteById(id);
    }
}

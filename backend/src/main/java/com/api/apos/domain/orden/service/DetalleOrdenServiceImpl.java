package com.api.apos.domain.orden.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.extra.entity.OpcionExtra;
import com.api.apos.domain.extra.repository.OpcionExtraRepository;
import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.domain.orden.entity.DetalleOrdenExtra;
import com.api.apos.domain.orden.repository.DetalleOrdenExtraRepository;
import com.api.apos.domain.orden.repository.DetalleOrdenRepository;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de detalles de orden
 * Maneja los items individuales de cada orden y sus extras
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DetalleOrdenServiceImpl implements DetalleOrdenService {
    
    private final DetalleOrdenRepository detalleOrdenRepository;
    private final DetalleOrdenExtraRepository detalleOrdenExtraRepository;
    private final OpcionExtraRepository opcionExtraRepository;

    /**
     * Agregar un detalle a una orden
     * Calcula automáticamente el subtotal basado en precio y cantidad
     * @param detalleOrden Detalle de orden a agregar
     * @return Detalle de orden creado con subtotal calculado
     */
    @Override
    public DetalleOrden agregarDetalleOrden(DetalleOrden detalleOrden) {
        detalleOrden.setCreatedAt(LocalDateTime.now());
        detalleOrden.setUpdatedAt(LocalDateTime.now());
        
        // Calcular subtotal si no está establecido
        if (detalleOrden.getSubtotal() == null) {
            detalleOrden = calcularSubtotalInterno(detalleOrden);
        }
        
        return detalleOrdenRepository.save(detalleOrden);
    }

    /**
     * Actualizar un detalle de orden existente
     * @param id ID del detalle de orden
     * @param detalleOrden Datos actualizados
     * @return Detalle de orden actualizado
     * @throws RuntimeException si el detalle no existe
     */
    @Override
    public DetalleOrden actualizarDetalleOrden(Long id, DetalleOrden detalleOrden) {
        DetalleOrden detalleExistente = detalleOrdenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle de orden no encontrado con ID: " + id));
        
        detalleExistente.setCantidad(detalleOrden.getCantidad());
        detalleExistente.setPrecioUnitario(detalleOrden.getPrecioUnitario());
        detalleExistente.setProducto(detalleOrden.getProducto());
        detalleExistente.setUpdatedAt(LocalDateTime.now());
        
        // Recalcular subtotal
        detalleExistente = calcularSubtotalInterno(detalleExistente);
        
        return detalleOrdenRepository.save(detalleExistente);
    }

    /**
     * Eliminar un detalle de orden
     * @param id ID del detalle de orden a eliminar
     * @throws RuntimeException si el detalle no existe
     */
    @Override
    public void eliminarDetalleOrden(Long id) {
        if (!detalleOrdenRepository.existsById(id)) {
            throw new RuntimeException("Detalle de orden no encontrado con ID: " + id);
        }
        detalleOrdenRepository.deleteById(id);
    }

    /**
     * Obtener un detalle de orden por su ID
     * @param id ID del detalle de orden
     * @return Optional con el detalle si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<DetalleOrden> obtenerDetalleOrdenPorId(Long id) {
        return detalleOrdenRepository.findById(id);
    }

    /**
     * Obtener todos los detalles de una orden
     * @param idOrden ID de la orden
     * @return Lista de detalles de la orden
     */
    @Override
    @Transactional(readOnly = true)
    public List<DetalleOrden> obtenerDetallesPorOrden(Long idOrden) {
        return detalleOrdenRepository.findByOrden_Id(idOrden);
    }

    /**
     * Actualizar la cantidad de un detalle de orden
     * Recalcula automáticamente el subtotal
     * @param id ID del detalle de orden
     * @param nuevaCantidad Nueva cantidad
     * @return Detalle de orden actualizado
     * @throws RuntimeException si el detalle no existe
     */
    @Override
    public DetalleOrden actualizarCantidad(Long id, Integer nuevaCantidad) {
        DetalleOrden detalle = detalleOrdenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle de orden no encontrado con ID: " + id));
        
        detalle.setCantidad(nuevaCantidad);
        detalle.setUpdatedAt(LocalDateTime.now());
        
        // Recalcular subtotal
        detalle = calcularSubtotalInterno(detalle);
        
        return detalleOrdenRepository.save(detalle);
    }

    /**
     * Calcular el subtotal de un detalle
     * Multiplica precio unitario por cantidad
     * @param id ID del detalle de orden
     * @return Detalle de orden con subtotal calculado
     * @throws RuntimeException si el detalle no existe
     */
    @Override
    public DetalleOrden calcularSubtotal(Long id) {
        DetalleOrden detalle = detalleOrdenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle de orden no encontrado con ID: " + id));
        
        detalle = calcularSubtotalInterno(detalle);
        return detalleOrdenRepository.save(detalle);
    }

    /**
     * Calcular el total de un detalle incluyendo extras
     * Suma subtotal base más el costo de todos los extras
     * @param id ID del detalle de orden
     * @return Total calculado incluyendo extras
     * @throws RuntimeException si el detalle no existe
     */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalDetalle(Long id) {
        DetalleOrden detalle = detalleOrdenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle de orden no encontrado con ID: " + id));
        
        BigDecimal totalBase = detalle.getSubtotal() != null ? detalle.getSubtotal() : BigDecimal.ZERO;
        
        // Sumar el costo de los extras
        if (detalle.getExtras() != null && !detalle.getExtras().isEmpty()) {
            BigDecimal totalExtras = detalle.getExtras().stream()
                    .map(DetalleOrdenExtra::getSubtotal)
                    .filter(s -> s != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return totalBase.add(totalExtras);
        }
        
        return totalBase;
    }

    /**
     * Agregar un extra a un detalle de orden
     * Crea la relación entre el detalle y la opción de extra
     * @param idDetalle ID del detalle de orden
     * @param idOpcionExtra ID de la opción de extra
     * @return Detalle de orden actualizado
     * @throws RuntimeException si el detalle o la opción de extra no existen
     */
    @Override
    public DetalleOrden agregarExtra(Long idDetalle, Long idOpcionExtra) {
        DetalleOrden detalle = detalleOrdenRepository.findById(idDetalle)
                .orElseThrow(() -> new RuntimeException("Detalle de orden no encontrado con ID: " + idDetalle));
        
        OpcionExtra opcionExtra = opcionExtraRepository.findById(idOpcionExtra)
                .orElseThrow(() -> new RuntimeException("Opción de extra no encontrada con ID: " + idOpcionExtra));
        
        // Crear el detalle de orden extra
        DetalleOrdenExtra detalleExtra = DetalleOrdenExtra.builder()
                .detalleOrden(detalle)
                .opcionExtra(opcionExtra)
                .cantidad(1)
                .precioUnitario(opcionExtra.getPrecio())
                .subtotal(opcionExtra.getPrecio())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        detalleOrdenExtraRepository.save(detalleExtra);
        
        // Actualizar el detalle para refrescar la relación
        return detalleOrdenRepository.findById(idDetalle)
                .orElseThrow(() -> new RuntimeException("Error al actualizar detalle"));
    }

    /**
     * Eliminar un extra de un detalle de orden
     * @param idDetalle ID del detalle de orden
     * @param idDetalleOrdenExtra ID del detalle de orden extra a eliminar
     * @throws RuntimeException si los IDs no son válidos
     */
    @Override
    public void eliminarExtra(Long idDetalle, Long idDetalleOrdenExtra) {
        DetalleOrdenExtra detalleExtra = detalleOrdenExtraRepository.findById(idDetalleOrdenExtra)
                .orElseThrow(() -> new RuntimeException("Detalle de orden extra no encontrado con ID: " + idDetalleOrdenExtra));
        
        // Verificar que pertenece al detalle correcto
        if (!detalleExtra.getDetalleOrden().getId().equals(idDetalle)) {
            throw new RuntimeException("El extra no pertenece al detalle especificado");
        }
        
        detalleOrdenExtraRepository.delete(detalleExtra);
    }

    /**
     * Obtener detalles de orden que contienen un producto específico
     * Útil para análisis de ventas y reportes
     * @param idProducto ID del producto
     * @return Lista de detalles de orden con el producto
     */
    @Override
    @Transactional(readOnly = true)
    public List<DetalleOrden> obtenerDetallesPorProducto(Long idProducto) {
        return detalleOrdenRepository.findByProducto_Id(idProducto);
    }

    /**
     * Método privado para calcular el subtotal internamente
     * @param detalle Detalle de orden
     * @return Detalle con subtotal calculado
     */
    private DetalleOrden calcularSubtotalInterno(DetalleOrden detalle) {
        if (detalle.getPrecioUnitario() != null && detalle.getCantidad() != null) {
            BigDecimal subtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));
            detalle.setSubtotal(subtotal);
        } else {
            detalle.setSubtotal(BigDecimal.ZERO);
        }
        return detalle;
    }
}

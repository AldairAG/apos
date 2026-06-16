package com.api.apos.domain.orden.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.orden.entity.DetalleOrden;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.domain.orden.repository.OrdenRepository;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de órdenes
 * Núcleo del sistema POS - maneja todo el flujo de órdenes desde creación hasta entrega
 */
@Service
@RequiredArgsConstructor
@Transactional
public class OrdenServiceImpl implements OrdenService {
    
    private final OrdenRepository ordenRepository;

    /**
     * Crear una nueva orden
     * Inicializa la orden con estado PENDIENTE y genera folio automáticamente
     * @param orden Orden a crear
     * @return Orden creada con folio y timestamp
     */
    @Override
    public Orden crearOrden(Orden orden) {
        orden.setFecha(LocalDateTime.now());
        orden.setCreatedAt(LocalDateTime.now());
        orden.setUpdatedAt(LocalDateTime.now());
        
        // Establecer estado inicial
        if (orden.getEstado() == null) {
            orden.setEstado(EstadoOrden.PENDIENTE);
        }
        
        if (orden.getCancelada() == null) {
            orden.setCancelada(false);
        }
        
        // Calcular totales
        orden = calcularTotalesInterno(orden);
        
        return ordenRepository.save(orden);
    }

    /**
     * Actualizar una orden existente
     * @param id ID de la orden
     * @param orden Datos actualizados
     * @return Orden actualizada
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden actualizarOrden(Long id, Orden orden) {
        Orden ordenExistente = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        
        ordenExistente.setTipo(orden.getTipo());
        ordenExistente.setNumeroPersonas(orden.getNumeroPersonas());
        ordenExistente.setObservaciones(orden.getObservaciones());
        ordenExistente.setNombreCliente(orden.getNombreCliente());
        ordenExistente.setTelefonoCliente(orden.getTelefonoCliente());
        ordenExistente.setDireccionEntrega(orden.getDireccionEntrega());
        ordenExistente.setFechaProgramada(orden.getFechaProgramada());
        ordenExistente.setMesa(orden.getMesa());
        ordenExistente.setUpdatedAt(LocalDateTime.now());
        ordenExistente.setUpdatedBy(orden.getUpdatedBy());
        
        return ordenRepository.save(ordenExistente);
    }

    /**
     * Cancelar una orden
     * Marca la orden como cancelada y registra el motivo
     * @param id ID de la orden
     * @param motivoCancelacion Motivo de la cancelación
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public void cancelarOrden(Long id, String motivoCancelacion) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        
        orden.setCancelada(true);
        orden.setEstado(EstadoOrden.CANCELADA);
        orden.setMotivoCancelacion(motivoCancelacion);
        orden.setFechaCancelacion(LocalDateTime.now());
        orden.setUpdatedAt(LocalDateTime.now());
        
        ordenRepository.save(orden);
    }

    /**
     * Obtener una orden por su ID
     * @param id ID de la orden
     * @return Optional con la orden si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Orden> obtenerOrdenPorId(Long id) {
        return ordenRepository.findById(id);
    }

    /**
     * Obtener una orden por su folio
     * Útil para búsquedas rápidas desde el POS
     * @param folio Folio de la orden
     * @return Optional con la orden si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Orden> obtenerOrdenPorFolio(String folio) {
        return ordenRepository.findByFolio(folio);
    }

    /**
     * Obtener todas las órdenes de una sucursal
     * @param idSucursal ID de la sucursal
     * @return Lista de órdenes
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesPorSucursal(Long idSucursal) {
        return ordenRepository.findBySucursal_Id(idSucursal);
    }

    /**
     * Obtener órdenes por estado
     * @param idSucursal ID de la sucursal
     * @param estado Estado de las órdenes
     * @return Lista de órdenes con el estado especificado
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesPorEstado(Long idSucursal, EstadoOrden estado) {
        return ordenRepository.findBySucursal_IdAndEstado(idSucursal, estado);
    }

    /**
     * Obtener órdenes por tipo
     * @param idSucursal ID de la sucursal
     * @param tipo Tipo de orden (COMER_AQUI, PARA_LLEVAR, DOMICILIO)
     * @return Lista de órdenes del tipo especificado
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesPorTipo(Long idSucursal, TipoOrden tipo) {
        return ordenRepository.findBySucursal_IdAndTipo(idSucursal, tipo);
    }

    /**
     * Obtener órdenes de una mesa específica
     * @param idMesa ID de la mesa
     * @return Lista de órdenes de la mesa
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesPorMesa(Long idMesa) {
        return ordenRepository.findByMesa_Id(idMesa);
    }

    /**
     * Obtener órdenes en un rango de fechas
     * @param idSucursal ID de la sucursal
     * @param fechaInicio Fecha de inicio del rango
     * @param fechaFin Fecha fin del rango
     * @return Lista de órdenes en el rango
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesPorFecha(Long idSucursal, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ordenRepository.findBySucursal_IdAndFechaBetween(idSucursal, fechaInicio, fechaFin);
    }

    /**
     * Obtener órdenes del día actual
     * Útil para el resumen diario del POS
     * @param idSucursal ID de la sucursal
     * @param fecha Fecha a consultar
     * @return Lista de órdenes del día
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesDelDia(Long idSucursal, LocalDate fecha) {
        return ordenRepository.findOrdenesDelDia(idSucursal, fecha);
    }

    /**
     * Obtener órdenes abiertas (PENDIENTE, EN_PREPARACION, LISTA)
     * Para el monitor de cocina y seguimiento en tiempo real
     * @param idSucursal ID de la sucursal
     * @return Lista de órdenes abiertas
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesAbiertas(Long idSucursal) {
        return ordenRepository.findOrdenesAbiertas(idSucursal);
    }

    /**
     * Obtener órdenes activas (no entregadas ni canceladas)
     * @param idSucursal ID de la sucursal
     * @return Lista de órdenes activas
     */
    @Override
    @Transactional(readOnly = true)
    public List<Orden> obtenerOrdenesActivas(Long idSucursal) {
        return ordenRepository.findOrdenesActivas(idSucursal);
    }

    /**
     * Cambiar el estado de una orden
     * Registra el cambio en el historial
     * @param id ID de la orden
     * @param nuevoEstado Nuevo estado
     * @param idEmpleado ID del empleado que realiza el cambio
     * @return Orden actualizada
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden cambiarEstadoOrden(Long id, EstadoOrden nuevoEstado, Long idEmpleado) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        
        orden.setEstado(nuevoEstado);
        orden.setUpdatedAt(LocalDateTime.now());
        orden.setUpdatedBy(idEmpleado);
        
        // Si el estado es ENTREGADA, registrar hora de entrega
        if (nuevoEstado == EstadoOrden.ENTREGADA) {
            orden.setHoraEntrega(LocalDateTime.now());
        }
        
        return ordenRepository.save(orden);
    }

    /**
     * Calcular totales de una orden
     * Suma subtotales de detalles, aplica descuentos, propinas e impuestos
     * @param id ID de la orden
     * @return Orden con totales calculados
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden calcularTotales(Long id) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        
        orden = calcularTotalesInterno(orden);
        return ordenRepository.save(orden);
    }

    /**
     * Aplicar descuento a una orden
     * @param id ID de la orden
     * @param descuento Monto del descuento
     * @return Orden con descuento aplicado
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden aplicarDescuento(Long id, BigDecimal descuento) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        
        orden.setDescuento(descuento);
        orden = calcularTotalesInterno(orden);
        orden.setUpdatedAt(LocalDateTime.now());
        
        return ordenRepository.save(orden);
    }

    /**
     * Aplicar propina a una orden
     * @param id ID de la orden
     * @param propina Monto de la propina
     * @return Orden con propina aplicada
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden aplicarPropina(Long id, BigDecimal propina) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        
        orden.setPropina(propina);
        orden = calcularTotalesInterno(orden);
        orden.setUpdatedAt(LocalDateTime.now());
        
        return ordenRepository.save(orden);
    }

    /**
     * Cerrar una orden
     * Marca como lista para entregar
     * @param id ID de la orden
     * @return Orden cerrada
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden cerrarOrden(Long id) {
        return cambiarEstadoOrden(id, EstadoOrden.LISTA, null);
    }

    /**
     * Completar una orden
     * Marca como entregada
     * @param id ID de la orden
     * @param idEmpleado ID del empleado que entrega
     * @return Orden completada
     * @throws RuntimeException si la orden no existe
     */
    @Override
    public Orden completarOrden(Long id, Long idEmpleado) {
        return cambiarEstadoOrden(id, EstadoOrden.ENTREGADA, idEmpleado);
    }

    /**
     * Calcular el total de una orden
     * @param id ID de la orden
     * @return Total calculado
     * @throws RuntimeException si la orden no existe
     */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalOrden(Long id) {
        Orden orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada con ID: " + id));
        return orden.getTotal() != null ? orden.getTotal() : BigDecimal.ZERO;
    }

    /**
     * Método privado para calcular totales internamente
     * @param orden Orden a calcular
     * @return Orden con totales calculados
     */
    private Orden calcularTotalesInterno(Orden orden) {
        // Calcular subtotal sumando detalles
        BigDecimal subtotal = BigDecimal.ZERO;
        if (orden.getDetalles() != null && !orden.getDetalles().isEmpty()) {
            subtotal = orden.getDetalles().stream()
                    .map(DetalleOrden::getSubtotal)
                    .filter(s -> s != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        orden.setSubtotal(subtotal);
        
        // Aplicar descuento
        BigDecimal descuento = orden.getDescuento() != null ? orden.getDescuento() : BigDecimal.ZERO;
        
        // Calcular impuestos (16% sobre subtotal - descuento)
        BigDecimal baseImponible = subtotal.subtract(descuento);
        BigDecimal impuestos = baseImponible.multiply(new BigDecimal("0.16"));
        orden.setImpuestos(impuestos);
        
        // Calcular total
        BigDecimal propina = orden.getPropina() != null ? orden.getPropina() : BigDecimal.ZERO;
        BigDecimal total = baseImponible.add(impuestos).add(propina);
        orden.setTotal(total);
        
        return orden;
    }
}

package com.api.apos.domain.producto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de productos
 * Maneja el catálogo completo de productos para el POS
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoServiceImpl implements ProductoService {
    
    private final ProductoRepository productoRepository;

    /**
     * Crear un nuevo producto
     * @param producto Producto a crear
     * @return Producto creado con timestamp
     */
    @Override
    public Producto crearProducto(Producto producto) {
        producto.setCreatedAt(LocalDateTime.now());
        producto.setUpdatedAt(LocalDateTime.now());
        if (producto.getActivo() == null) {
            producto.setActivo(true);
        }
        if (producto.getDisponible() == null) {
            producto.setDisponible(true);
        }
        if (producto.getDestacado() == null) {
            producto.setDestacado(false);
        }
        return productoRepository.save(producto);
    }

    /**
     * Actualizar un producto existente
     * @param id ID del producto
     * @param producto Datos actualizados del producto
     * @return Producto actualizado
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public Producto actualizarProducto(Long id, Producto producto) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        
        productoExistente.setNombre(producto.getNombre());
        productoExistente.setCodigo(producto.getCodigo());
        productoExistente.setSku(producto.getSku());
        productoExistente.setDescripcion(producto.getDescripcion());
        productoExistente.setImagen(producto.getImagen());
        productoExistente.setPrecioVenta(producto.getPrecioVenta());
        productoExistente.setCosto(producto.getCosto());
        productoExistente.setMargen(producto.getMargen());
        productoExistente.setTiempoPreparacion(producto.getTiempoPreparacion());
        productoExistente.setOrden(producto.getOrden());
        productoExistente.setCategoria(producto.getCategoria());
        productoExistente.setReceta(producto.getReceta());
        productoExistente.setUpdatedAt(LocalDateTime.now());
        productoExistente.setUpdatedBy(producto.getUpdatedBy());
        
        return productoRepository.save(productoExistente);
    }

    /**
     * Eliminar un producto (borrado lógico)
     * @param id ID del producto a eliminar
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.setActivo(false);
        producto.setUpdatedAt(LocalDateTime.now());
        productoRepository.save(producto);
    }

    /**
     * Obtener un producto por ID
     * @param id ID del producto
     * @return Optional con el producto si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id);
    }

    /**
     * Obtener todos los productos de una sucursal
     * @param idSucursal ID de la sucursal
     * @return Lista de productos
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosPorSucursal(Long idSucursal) {
        // Implementación básica - se puede mejorar con relación Producto-Sucursal
        return productoRepository.findAll();
    }

    /**
     * Obtener productos activos de una sucursal
     * Filtra productos que están activos y disponibles para venta
     * @param idSucursal ID de la sucursal
     * @return Lista de productos activos
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosActivos(Long idSucursal) {
        return productoRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()) && 
                           Boolean.TRUE.equals(p.getDisponible()))
                .toList();
    }

    /**
     * Activar o desactivar un producto
     * @param id ID del producto
     * @param activo Estado activo/inactivo
     * @return Producto actualizado
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public Producto cambiarEstadoActivo(Long id, boolean activo) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.setActivo(activo);
        producto.setUpdatedAt(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    /**
     * Marcar producto como agotado o disponible
     * Útil para gestionar inventario en tiempo real
     * @param id ID del producto
     * @param agotado Estado agotado/disponible
     * @return Producto actualizado
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public Producto cambiarEstadoAgotado(Long id, boolean agotado) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.setDisponible(!agotado);
        producto.setUpdatedAt(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    /**
     * Obtener productos asociados a una receta
     * @param idReceta ID de la receta
     * @return Lista de productos
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosPorReceta(Long idReceta) {
        return productoRepository.findByReceta_Id(idReceta);
    }

    /**
     * Actualizar precio de un producto
     * @param id ID del producto
     * @param precio Nuevo precio
     * @return Producto actualizado
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public Producto actualizarPrecio(Long id, Float precio) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.setPrecioVenta(BigDecimal.valueOf(precio));
        producto.setUpdatedAt(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    /**
     * Buscar productos por nombre, código o SKU
     * Permite búsqueda rápida en el POS
     * @param idSucursal ID de la sucursal
     * @param termino Término de búsqueda
     * @return Lista de productos que coinciden
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> buscarProductos(Long idSucursal, String termino) {
        return productoRepository.buscarProductos(termino);
    }

    /**
     * Obtener productos por categoría
     * @param idCategoria ID de la categoría
     * @return Lista de productos de la categoría
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosPorCategoria(Long idCategoria) {
        return productoRepository.findByCategoria_Id(idCategoria);
    }

    /**
     * Obtener productos destacados
     * Útil para mostrar promociones o productos especiales
     * @param idSucursal ID de la sucursal
     * @return Lista de productos destacados
     */
    @Override
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosDestacados(Long idSucursal) {
        return productoRepository.findByActivoTrueAndDestacadoTrue();
    }

    /**
     * Marcar producto como destacado
     * @param id ID del producto
     * @param destacado Estado destacado
     * @return Producto actualizado
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public Producto cambiarEstadoDestacado(Long id, boolean destacado) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.setDestacado(destacado);
        producto.setUpdatedAt(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    /**
     * Actualizar orden de visualización
     * Define el orden en que aparecen los productos en el menú
     * @param id ID del producto
     * @param orden Nuevo orden
     * @return Producto actualizado
     * @throws RuntimeException si el producto no existe
     */
    @Override
    public Producto actualizarOrden(Long id, Integer orden) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        producto.setOrden(orden);
        producto.setUpdatedAt(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    /**
     * Obtener producto por código
     * Búsqueda por el código único del producto
     * @param codigo Código del producto
     * @return Optional con el producto si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> obtenerProductoPorCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo);
    }

    /**
     * Obtener producto por SKU
     * Búsqueda por el SKU único del producto
     * @param sku SKU del producto
     * @return Optional con el producto si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> obtenerProductoPorSku(String sku) {
        return productoRepository.findBySku(sku);
    }
}

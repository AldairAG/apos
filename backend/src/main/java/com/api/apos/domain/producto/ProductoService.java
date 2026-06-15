package com.api.apos.domain.producto;

import java.util.List;
import java.util.Optional;

public interface ProductoService {
    
    /**
     * Crear un nuevo producto
     * @param producto Producto a crear
     * @return Producto creado
     */
    Producto crearProducto(Producto producto);
    
    /**
     * Actualizar un producto existente
     * @param id ID del producto
     * @param producto Datos actualizados del producto
     * @return Producto actualizado
     */
    Producto actualizarProducto(Long id, Producto producto);
    
    /**
     * Eliminar un producto
     * @param id ID del producto a eliminar
     */
    void eliminarProducto(Long id);
    
    /**
     * Obtener un producto por ID
     * @param id ID del producto
     * @return Optional con el producto si existe
     */
    Optional<Producto> obtenerProductoPorId(Long id);
    
    /**
     * Obtener todos los productos de una sucursal
     * @param idSucursal ID de la sucursal
     * @return Lista de productos
     */
    List<Producto> obtenerProductosPorSucursal(Long idSucursal);
    
    /**
     * Obtener productos activos de una sucursal
     * @param idSucursal ID de la sucursal
     * @return Lista de productos activos
     */
    List<Producto> obtenerProductosActivos(Long idSucursal);
    
    /**
     * Activar o desactivar un producto
     * @param id ID del producto
     * @param activo Estado activo/inactivo
     * @return Producto actualizado
     */
    Producto cambiarEstadoActivo(Long id, boolean activo);
    
    /**
     * Marcar producto como agotado o disponible
     * @param id ID del producto
     * @param agotado Estado agotado/disponible
     * @return Producto actualizado
     */
    Producto cambiarEstadoAgotado(Long id, boolean agotado);
    
    /**
     * Obtener productos asociados a una receta
     * @param idReceta ID de la receta
     * @return Lista de productos
     */
    List<Producto> obtenerProductosPorReceta(Long idReceta);
    
    /**
     * Actualizar precio de un producto
     * @param id ID del producto
     * @param precio Nuevo precio
     * @return Producto actualizado
     */
    Producto actualizarPrecio(Long id, Float precio);
}

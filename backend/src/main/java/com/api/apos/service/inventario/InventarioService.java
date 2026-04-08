package com.api.apos.service.inventario;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.InventarioProducto;

import java.util.List;

public interface InventarioService {

    // ==================== INVENTARIO ====================

    Inventario obtenerInventarioPorSucursal(Long sucursalId);

    Inventario crearInventarioParaSucursal(Long sucursalId);

    // ==================== INVENTARIO ITEMS (Materiales) ====================

    List<InventarioItem> obtenerItemsPorInventario(Long inventarioId);

    InventarioItem obtenerItemPorId(Long itemId);

    InventarioItem agregarItem(Long inventarioId, Long materialId, Double cantidad, Double stockMinimo,
            Double stockMaximo, Double precioUnitario);

    InventarioItem actualizarItem(Long itemId, Double cantidad, Double stockMinimo, Double stockMaximo,
            Double precioUnitario);

    void eliminarItem(Long itemId);

    InventarioItem actualizarStockMaterial(Long inventarioId, Long materialId, Double cantidadDelta);

    List<InventarioItem> obtenerItemsConStockBajo(Long inventarioId);

    // ==================== INVENTARIO PRODUCTOS ELABORADOS ====================

    List<InventarioProducto> obtenerProductosPorInventario(Long inventarioId);

    InventarioProducto obtenerProductoPorId(Long productoId);

    InventarioProducto agregarProductoElaborado(Long inventarioId, Long productoElaboradoId, Double cantidad,
            Double stockMinimo);

    InventarioProducto actualizarProductoElaborado(Long productoId, Double cantidad, Double stockMinimo);

    void eliminarProductoElaborado(Long productoId);

    InventarioProducto actualizarStockProducto(Long inventarioId, Long productoElaboradoId, Double cantidadDelta);

    List<InventarioProducto> obtenerProductosConStockBajo(Long inventarioId);
}

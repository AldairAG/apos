package com.api.apos.service.inventario;

import com.api.apos.dto.request.AgregarItemRequest;
import com.api.apos.dto.request.AgregarProductoElaboradoRequest;
import com.api.apos.dto.request.ActualizarStockProductoRequest;
import com.api.apos.dto.response.ProductoElaboradoStockResponse;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;
import com.api.apos.entity.InventarioProducto;

import java.util.List;

public interface InventarioService {

        // ==================== INVENTARIO ====================

        Inventario obtenerInventarioPorSucursal(Long sucursalId);

        // ==================== INVENTARIO ITEMS (Materiales) ====================

        InventarioItem agregarItemInventario(Long inventarioId,AgregarItemRequest request);

        InventarioItem editarItemInventario(Long itemId, AgregarItemRequest request);

        void eliminarItemInventario(Long itemId);

        List<InventarioItem> obtenerItemsPorInventario(Long inventarioId);

        List<InventarioItem> obtenerItemsConStockBajo(Long inventarioId);

        // ==================== INVENTARIO PRODUCTOS ELABORADOS ====================

        InventarioProducto agregarProductoElaborado(Long inventarioId, AgregarProductoElaboradoRequest request);

        InventarioProducto actualizarStockProducto(Long inventarioProductoId, ActualizarStockProductoRequest request);

        void incrementarStockProducto(Long inventarioId, Long productoElaboradoId, Double cantidad);

        void consumirProductoElaborado(Long inventarioId, Long productoElaboradoId, Double cantidad);

        void eliminarProductoElaborado(Long inventarioProductoId);

        List<ProductoElaboradoStockResponse> obtenerProductosElaboradosPorInventario(Long inventarioId);

        List<ProductoElaboradoStockResponse> obtenerProductosElaboradosConStockBajo(Long inventarioId);

        ProductoElaboradoStockResponse obtenerProductoElaboradoPorId(Long inventarioProductoId);

}

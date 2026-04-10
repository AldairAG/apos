package com.api.apos.service.inventario;

import com.api.apos.dto.request.AgregarItemRequest;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.InventarioItem;

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

}

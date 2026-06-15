package com.api.apos.domain.compra.service;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.compra.entity.CompraInventario;
import com.api.apos.enums.EstadoCompra;

public interface CompraInventarioService {
    CompraInventario crearCompra(CompraInventario compra);
    CompraInventario actualizarCompra(Long id, CompraInventario compra);
    void cancelarCompra(Long id);
    CompraInventario obtenerCompraPorId(Long id);
    List<CompraInventario> obtenerComprasPorSucursal(Long idSucursal);
    List<CompraInventario> obtenerComprasPorEstado(Long idSucursal, EstadoCompra estado);
    List<CompraInventario> obtenerComprasPorProveedor(Long idSucursal, String proveedor);
    List<CompraInventario> obtenerComprasPorFecha(Long idSucursal, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    CompraInventario recibirCompra(Long id, LocalDateTime fechaRecepcion);
}

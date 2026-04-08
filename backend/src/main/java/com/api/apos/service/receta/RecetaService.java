package com.api.apos.service.receta;

import com.api.apos.entity.ProduccionReceta;
import com.api.apos.entity.ProductoElaborado;
import com.api.apos.entity.Receta;
import com.api.apos.entity.RecetaIngrediente;
import com.api.apos.enums.TipoReceta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface RecetaService {

    // ==================== RECETAS ====================

    List<Receta> obtenerRecetasPorSucursal(Long sucursalId);

    List<Receta> obtenerRecetasActivasPorSucursal(Long sucursalId);

    Receta obtenerRecetaPorId(Long recetaId);

    Receta crearReceta(Long sucursalId, String nombre, String descripcion, Integer tiempoPreparacion,
            Integer porciones, BigDecimal precioVenta, TipoReceta tipoReceta);

    Receta actualizarReceta(Long recetaId, String nombre, String descripcion, Integer tiempoPreparacion,
            Integer porciones, BigDecimal precioVenta, TipoReceta tipoReceta);

    void eliminarReceta(Long recetaId);

    Receta activarDesactivarReceta(Long recetaId, Boolean activa);

    // ==================== INGREDIENTES DE RECETA ====================

    List<RecetaIngrediente> obtenerIngredientes(Long recetaId);

    RecetaIngrediente agregarIngredienteMaterial(Long recetaId, Long materialId, BigDecimal cantidadRequerida,
            String notas);

    RecetaIngrediente agregarIngredienteProductoElaborado(Long recetaId, Long productoElaboradoId,
            BigDecimal cantidadRequerida, String notas);

    RecetaIngrediente actualizarIngrediente(Long ingredienteId, BigDecimal cantidadRequerida, String notas);

    void eliminarIngrediente(Long ingredienteId);

    // ==================== PRODUCTOS ELABORADOS ====================

    List<ProductoElaborado> obtenerProductosElaboradosActivos();

    ProductoElaborado obtenerProductoElaboradoPorId(Long productoElaboradoId);

    ProductoElaborado crearProductoElaborado(Long recetaOrigenId, String nombre, String descripcion,
            String unidadMedida);

    ProductoElaborado actualizarProductoElaborado(Long productoElaboradoId, String nombre, String descripcion,
            String unidadMedida);

    ProductoElaborado activarDesactivarProductoElaborado(Long productoElaboradoId, Boolean activo);

    // ==================== PRODUCCIÓN (Elaborar receta) ====================

    ProduccionReceta elaborarReceta(Long recetaId, Long sucursalId, Long usuarioId, Integer cantidad,
            String observaciones);

    List<ProduccionReceta> obtenerProduccionesPorSucursal(Long sucursalId);

    List<ProduccionReceta> obtenerProduccionesPorReceta(Long recetaId);

    List<ProduccionReceta> obtenerProduccionesPorUsuario(Long usuarioId);

    List<ProduccionReceta> obtenerProduccionesPorRangoFecha(LocalDateTime inicio, LocalDateTime fin);
}

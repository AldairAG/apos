package com.api.apos.service.receta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.Material;
import com.api.apos.entity.ProduccionReceta;
import com.api.apos.entity.ProductoElaborado;
import com.api.apos.entity.Receta;
import com.api.apos.entity.RecetaIngrediente;
import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Usuario;
import com.api.apos.enums.TipoIngrediente;
import com.api.apos.enums.TipoReceta;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.ProduccionRecetaRepository;
import com.api.apos.repository.ProductoElaboradoRepository;
import com.api.apos.repository.RecetaIngredienteRepository;
import com.api.apos.repository.RecetaRepository;
import com.api.apos.repository.SucursalRepository;
import com.api.apos.repository.UsuarioRepository;
import com.api.apos.service.inventario.InventarioService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RecetaServiceImpl implements RecetaService {

    @Autowired
    private RecetaRepository recetaRepository;

    @Autowired
    private RecetaIngredienteRepository recetaIngredienteRepository;

    @Autowired
    private ProductoElaboradoRepository productoElaboradoRepository;

    @Autowired
    private ProduccionRecetaRepository produccionRecetaRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InventarioService inventarioService;

    // ==================== RECETAS ====================

    @Override
    @Transactional(readOnly = true)
    public List<Receta> obtenerRecetasPorSucursal(Long sucursalId) {
        return recetaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Receta> obtenerRecetasActivasPorSucursal(Long sucursalId) {
        return recetaRepository.findBySucursalIdAndActivaTrue(sucursalId);
    }

    @Override
    @Transactional(readOnly = true)
    public Receta obtenerRecetaPorId(Long recetaId) {
        return recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaId));
    }

    @Override
    @Transactional
    public Receta crearReceta(Long sucursalId, String nombre, String descripcion, Integer tiempoPreparacion,
            Integer porciones, BigDecimal precioVenta, TipoReceta tipoReceta) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + sucursalId));

        Receta receta = new Receta();
        receta.setSucursal(sucursal);
        receta.setNombre(nombre);
        receta.setDescripcion(descripcion);
        receta.setTiempoPreparacion(tiempoPreparacion);
        receta.setPorciones(porciones);
        receta.setPrecioVenta(precioVenta);
        receta.setTipoReceta(tipoReceta);
        receta.setActiva(true);
        receta.setFechaCreacion(LocalDateTime.now());
        receta.setFechaActualizacion(LocalDateTime.now());

        return recetaRepository.save(receta);
    }

    @Override
    @Transactional
    public Receta actualizarReceta(Long recetaId, String nombre, String descripcion, Integer tiempoPreparacion,
            Integer porciones, BigDecimal precioVenta, TipoReceta tipoReceta) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaId));

        if (nombre != null)
            receta.setNombre(nombre);
        if (descripcion != null)
            receta.setDescripcion(descripcion);
        if (tiempoPreparacion != null)
            receta.setTiempoPreparacion(tiempoPreparacion);
        if (porciones != null)
            receta.setPorciones(porciones);
        if (precioVenta != null)
            receta.setPrecioVenta(precioVenta);
        if (tipoReceta != null)
            receta.setTipoReceta(tipoReceta);

        receta.setFechaActualizacion(LocalDateTime.now());
        return recetaRepository.save(receta);
    }

    @Override
    @Transactional
    public void eliminarReceta(Long recetaId) {
        if (!recetaRepository.existsById(recetaId)) {
            throw new EntityNotFoundException("Receta no encontrada con id: " + recetaId);
        }
        recetaRepository.deleteById(recetaId);
    }

    @Override
    @Transactional
    public Receta activarDesactivarReceta(Long recetaId, Boolean activa) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaId));

        receta.setActiva(activa);
        receta.setFechaActualizacion(LocalDateTime.now());
        return recetaRepository.save(receta);
    }

    // ==================== INGREDIENTES DE RECETA ====================

    @Override
    @Transactional(readOnly = true)
    public List<RecetaIngrediente> obtenerIngredientes(Long recetaId) {
        return recetaIngredienteRepository.findByRecetaId(recetaId);
    }

    @Override
    @Transactional
    public RecetaIngrediente agregarIngredienteMaterial(Long recetaId, Long materialId, BigDecimal cantidadRequerida,
            String notas) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaId));

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material no encontrado con id: " + materialId));

        RecetaIngrediente ingrediente = new RecetaIngrediente();
        ingrediente.setReceta(receta);
        ingrediente.setMaterial(material);
        ingrediente.setTipoIngrediente(TipoIngrediente.MATERIAL);
        ingrediente.setCantidadRequerida(cantidadRequerida);
        ingrediente.setNotas(notas);

        return recetaIngredienteRepository.save(ingrediente);
    }

    @Override
    @Transactional
    public RecetaIngrediente agregarIngredienteProductoElaborado(Long recetaId, Long productoElaboradoId,
            BigDecimal cantidadRequerida, String notas) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaId));

        ProductoElaborado productoElaborado = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ProductoElaborado no encontrado con id: " + productoElaboradoId));

        RecetaIngrediente ingrediente = new RecetaIngrediente();
        ingrediente.setReceta(receta);
        ingrediente.setProductoElaborado(productoElaborado);
        ingrediente.setTipoIngrediente(TipoIngrediente.PRODUCTO_ELABORADO);
        ingrediente.setCantidadRequerida(cantidadRequerida);
        ingrediente.setNotas(notas);

        return recetaIngredienteRepository.save(ingrediente);
    }

    @Override
    @Transactional
    public RecetaIngrediente actualizarIngrediente(Long ingredienteId, BigDecimal cantidadRequerida, String notas) {
        RecetaIngrediente ingrediente = recetaIngredienteRepository.findById(ingredienteId)
                .orElseThrow(
                        () -> new EntityNotFoundException("RecetaIngrediente no encontrado con id: " + ingredienteId));

        if (cantidadRequerida != null)
            ingrediente.setCantidadRequerida(cantidadRequerida);
        if (notas != null)
            ingrediente.setNotas(notas);

        return recetaIngredienteRepository.save(ingrediente);
    }

    @Override
    @Transactional
    public void eliminarIngrediente(Long ingredienteId) {
        if (!recetaIngredienteRepository.existsById(ingredienteId)) {
            throw new EntityNotFoundException("RecetaIngrediente no encontrado con id: " + ingredienteId);
        }
        recetaIngredienteRepository.deleteById(ingredienteId);
    }

    // ==================== PRODUCTOS ELABORADOS ====================

    @Override
    @Transactional(readOnly = true)
    public List<ProductoElaborado> obtenerProductosElaboradosActivos() {
        return productoElaboradoRepository.findByActivoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoElaborado obtenerProductoElaboradoPorId(Long productoElaboradoId) {
        return productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ProductoElaborado no encontrado con id: " + productoElaboradoId));
    }

    @Override
    @Transactional
    public ProductoElaborado crearProductoElaborado(Long recetaOrigenId, String nombre, String descripcion,
            String unidadMedida) {
        Receta receta = recetaRepository.findById(recetaOrigenId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaOrigenId));

        productoElaboradoRepository.findByRecetaOrigenId(recetaOrigenId)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "La receta ya tiene un producto elaborado asociado: " + existing.getNombre());
                });

        ProductoElaborado producto = new ProductoElaborado();
        producto.setRecetaOrigen(receta);
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setUnidadMedida(unidadMedida);
        producto.setActivo(true);
        producto.setFechaCreacion(LocalDateTime.now());

        return productoElaboradoRepository.save(producto);
    }

    @Override
    @Transactional
    public ProductoElaborado actualizarProductoElaborado(Long productoElaboradoId, String nombre, String descripcion,
            String unidadMedida) {
        ProductoElaborado producto = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ProductoElaborado no encontrado con id: " + productoElaboradoId));

        if (nombre != null)
            producto.setNombre(nombre);
        if (descripcion != null)
            producto.setDescripcion(descripcion);
        if (unidadMedida != null)
            producto.setUnidadMedida(unidadMedida);

        return productoElaboradoRepository.save(producto);
    }

    @Override
    @Transactional
    public ProductoElaborado activarDesactivarProductoElaborado(Long productoElaboradoId, Boolean activo) {
        ProductoElaborado producto = productoElaboradoRepository.findById(productoElaboradoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ProductoElaborado no encontrado con id: " + productoElaboradoId));

        producto.setActivo(activo);
        return productoElaboradoRepository.save(producto);
    }

    // ==================== PRODUCCIÓN (Elaborar receta) ====================

    @Override
    @Transactional
    public ProduccionReceta elaborarReceta(Long recetaId, Long sucursalId, Long usuarioId, Integer cantidad,
            String observaciones) {
        Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada con id: " + recetaId));

        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + sucursalId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + usuarioId));

        Inventario inventario = inventarioService.obtenerInventarioPorSucursal(sucursalId);

        // Descontar ingredientes del inventario
        List<RecetaIngrediente> ingredientes = recetaIngredienteRepository.findByRecetaId(recetaId);
        for (RecetaIngrediente ingrediente : ingredientes) {
            double cantidadTotal = ingrediente.getCantidadRequerida().doubleValue() * cantidad;

            if (ingrediente.getTipoIngrediente() == TipoIngrediente.MATERIAL) {
                inventarioService.actualizarStockMaterial(
                        inventario.getId(),
                        ingrediente.getMaterial().getId(),
                        -cantidadTotal);
            } else if (ingrediente.getTipoIngrediente() == TipoIngrediente.PRODUCTO_ELABORADO) {
                inventarioService.actualizarStockProducto(
                        inventario.getId(),
                        ingrediente.getProductoElaborado().getId(),
                        -cantidadTotal);
            }
        }

        // Si la receta genera un producto elaborado, sumar al inventario
        if (receta.getTipoReceta() == TipoReceta.INTERMEDIA && receta.getProductoElaborado() != null) {
            inventarioService.actualizarStockProducto(
                    inventario.getId(),
                    receta.getProductoElaborado().getId(),
                    (double) (receta.getPorciones() * cantidad));
        }

        // Registrar la producción
        ProduccionReceta produccion = new ProduccionReceta();
        produccion.setReceta(receta);
        produccion.setSucursal(sucursal);
        produccion.setUsuario(usuario);
        produccion.setCantidad(cantidad);
        produccion.setFechaProduccion(LocalDateTime.now());
        produccion.setObservaciones(observaciones);

        return produccionRecetaRepository.save(produccion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduccionReceta> obtenerProduccionesPorSucursal(Long sucursalId) {
        return produccionRecetaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduccionReceta> obtenerProduccionesPorReceta(Long recetaId) {
        return produccionRecetaRepository.findByRecetaId(recetaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduccionReceta> obtenerProduccionesPorUsuario(Long usuarioId) {
        return produccionRecetaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduccionReceta> obtenerProduccionesPorRangoFecha(LocalDateTime inicio, LocalDateTime fin) {
        return produccionRecetaRepository.findByFechaProduccionBetween(inicio, fin);
    }
}

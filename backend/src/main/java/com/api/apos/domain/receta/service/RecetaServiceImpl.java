package com.api.apos.domain.receta.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.material.Material;
import com.api.apos.domain.material.service.MaterialService;
import com.api.apos.domain.receta.dto.CrearRecetaDTO;
import com.api.apos.domain.receta.entity.DetalleReceta;
import com.api.apos.domain.receta.entity.Receta;
import com.api.apos.domain.receta.repository.RecetaRepository;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.domain.usuario.service.UsuarioService;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de gestión de recetas
 * Maneja operaciones CRUD, cálculo de costos y verificación de disponibilidad de materiales
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RecetaServiceImpl implements RecetaService {
    
    private final RecetaRepository recetaRepository;

    private final UsuarioService usuarioService;

    private final MaterialService materialService;

    /**
     * Crear una nueva receta
     * @param receta Receta a crear
     * @return Receta creada con timestamp
     */
    @Override
    public Receta crearReceta(CrearRecetaDTO recetaNueva) {
        Usuario usuario = usuarioService.obtenerUsuarioAutenticado();

        List<DetalleReceta> detalles = recetaNueva.getDetalles().stream()
                .map(detalle -> {

                    Material material = materialService.obtenerMaterialPorId(detalle.getId())
                            .orElseThrow(() -> new RuntimeException("Material no encontrado con ID: " + detalle.getId()));

                    DetalleReceta nuevoDetalle = DetalleReceta.builder()
                            .id(null)
                            .material(material)
                            .cantidad(detalle.getCantidad())
                            .unidadMedida(detalle.getUnidadMedida())
                            .build();
                    nuevoDetalle.setReceta(null); // Se asignará la receta después de crearla
                    return nuevoDetalle;
                })
                .toList();

        Receta receta = Receta.builder()
                .usuario(usuario)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .activa(true)
                .costoTotal(recalcularCostoTotal(detalles)) // Inicialmente calcular costo total
                .rendimiento(recetaNueva.getRendimiento())
                .unidadRendimiento(recetaNueva.getUnidadRendimiento())
                .nombre(recetaNueva.getNombre())
                .descripcion(recetaNueva.getDescripcion())
                .instrucciones(recetaNueva.getInstrucciones())
                .tiempoPreparacion(recetaNueva.getTiempoPreparacion())
                .build();
        
        detalles.forEach(detalle -> detalle.setReceta(receta)); // Asignar la receta a cada detalle

        receta.setDetalles(detalles); // Asignar la lista de detalles a la receta

        
        return recetaRepository.save(receta);
    }

    /**
     * Actualizar una receta existente
     * @param id ID de la receta
     * @param receta Datos actualizados
     * @return Receta actualizada
     * @throws RuntimeException si la receta no existe
     */
    @Override
    public Receta actualizarReceta(Long id, Receta receta) {
        Receta recetaExistente = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
        
        recetaExistente.setNombre(receta.getNombre());
        recetaExistente.setCodigo(receta.getCodigo());
        recetaExistente.setDescripcion(receta.getDescripcion());
        recetaExistente.setInstrucciones(receta.getInstrucciones());
        recetaExistente.setImagen(receta.getImagen());
        recetaExistente.setRendimiento(receta.getRendimiento());
        recetaExistente.setUnidadRendimiento(receta.getUnidadRendimiento());
        recetaExistente.setTiempoPreparacion(receta.getTiempoPreparacion());
        recetaExistente.setUpdatedAt(LocalDateTime.now());
        recetaExistente.setUpdatedBy(receta.getUpdatedBy());
        
        return recetaRepository.save(recetaExistente);
    }

    /**
     * Eliminar una receta (borrado lógico)
     * @param id ID de la receta a eliminar
     * @throws RuntimeException si la receta no existe
     */
    @Override
    public void eliminarReceta(Long id) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
        receta.setActiva(false);
        receta.setUpdatedAt(LocalDateTime.now());
        recetaRepository.save(receta);
    }

    /**
     * Obtener una receta por su ID
     * @param id ID de la receta
     * @return Optional con la receta si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Receta> obtenerRecetaPorId(Long id) {
        return recetaRepository.findById(id);
    }

    /**
     * Obtener recetas por usuario
     * @param idUsuario ID del usuario
     * @return Lista de recetas del usuario
     */
    @Override
    @Transactional(readOnly = true)
    public List<Receta> obtenerRecetasPorUsuario(Long idUsuario) {
        return recetaRepository.findAll().stream()
                .filter(r -> r.getUsuario() != null && r.getUsuario().getId().equals(idUsuario))
                .toList();
    }

    /**
     * Obtener solo recetas activas de un usuario
     * @param idUsuario ID del usuario
     * @return Lista de recetas activas
     */
    @Override
    @Transactional(readOnly = true)
    public List<Receta> obtenerRecetasActivas(Long idUsuario) {
        return recetaRepository.findAll().stream()
                .filter(r -> r.getUsuario() != null && 
                           r.getUsuario().getId().equals(idUsuario) && 
                           Boolean.TRUE.equals(r.getActiva()))
                .toList();
    }

    /**
     * Calcular el costo total de una receta
     * Suma el costo de todos los materiales usados en la receta
     * @param id ID de la receta
     * @return Costo total calculado
     * @throws RuntimeException si la receta no existe
     */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularCostoReceta(Long id) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
        
        if (receta.getDetalles() == null || receta.getDetalles().isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return receta.getDetalles().stream()
                .map(detalle -> {
                    if (detalle.getMaterial() != null && 
                        detalle.getMaterial().getCostoUnitario() != null && 
                        detalle.getCantidad() != null) {
                        return detalle.getMaterial().getCostoUnitario()
                                .multiply(detalle.getCantidad());
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Recalcular y actualizar el costo total de una receta
     * @param id ID de la receta
     * @return Receta con costo actualizado
     * @throws RuntimeException si la receta no existe
     */
    @Override
    public Receta recalcularCostoTotal(Long id) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
        
        BigDecimal costoTotal = calcularCostoReceta(id);
        receta.setCostoTotal(costoTotal);
        receta.setUpdatedAt(LocalDateTime.now());
        
        return recetaRepository.save(receta);
    }

    /**
     * Verificar si hay materiales disponibles para preparar la receta
     * @param id ID de la receta
     * @return true si todos los materiales están disponibles
     * @throws RuntimeException si la receta no existe
     */
    @Override
    @Transactional(readOnly = true)
    public boolean verificarDisponibilidadMateriales(Long id) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
        
        if (receta.getDetalles() == null || receta.getDetalles().isEmpty()) {
            return false;
        }
        
        // Verificar que todos los materiales estén activos
        return receta.getDetalles().stream()
                .allMatch(detalle -> detalle.getMaterial() != null && 
                                   Boolean.TRUE.equals(detalle.getMaterial().getActivo()));
    }

    /**
     * Cambiar el estado activo de una receta
     * @param id ID de la receta
     * @param activo Nuevo estado
     * @return Receta actualizada
     * @throws RuntimeException si la receta no existe
     */
    @Override
    public Receta cambiarEstadoActivo(Long id, boolean activo) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada con ID: " + id));
        receta.setActiva(activo);
        receta.setUpdatedAt(LocalDateTime.now());
        return recetaRepository.save(receta);
    }

    /**
     * Buscar recetas por término de búsqueda
     * Busca en nombre, código y descripción
     * @param idUsuario ID del usuario
     * @param termino Término de búsqueda
     * @return Lista de recetas que coinciden
     */
    @Override
    @Transactional(readOnly = true)
    public List<Receta> buscarRecetas(Long idUsuario, String termino) {
        List<Receta> recetas = obtenerRecetasActivas(idUsuario);
        return recetas.stream()
                .filter(r -> r.getNombre().toLowerCase().contains(termino.toLowerCase()) ||
                           (r.getCodigo() != null && r.getCodigo().toLowerCase().contains(termino.toLowerCase())) ||
                           (r.getDescripcion() != null && r.getDescripcion().toLowerCase().contains(termino.toLowerCase())))
                .toList();
    }

    @Override
    public BigDecimal recalcularCostoTotal(List<DetalleReceta> detallesReceta) {
        if (detallesReceta == null || detallesReceta.isEmpty()) {
            throw new IllegalArgumentException("Lista de detalles de receta inválida para recalcular costo");
        }
        BigDecimal nuevoCosto = detallesReceta.stream()
                .filter(detalle -> detalle.getMaterial() != null && detalle.getMaterial().getCostoUnitario() != null && detalle.getCantidad() != null)
                .map(detalle -> detalle.getMaterial().getCostoUnitario().multiply(detalle.getCantidad()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return nuevoCosto;
    }

    @Override
    public List<Receta> obtenerRecetasByUsuarioAutenticado() {
        Usuario usuario = usuarioService.obtenerUsuarioAutenticado();
        return recetaRepository.findByUsuario_Id(usuario.getId());
    }
}

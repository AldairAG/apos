package com.api.apos.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.api.apos.dto.RecetaDTO;
import com.api.apos.dto.RecetaIngredienteDTO;
import com.api.apos.entity.Material;
import com.api.apos.entity.ProductoElaborado;
import com.api.apos.entity.Receta;
import com.api.apos.entity.RecetaIngrediente;
import com.api.apos.entity.Sucursal;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.repository.MaterialRepository;
import com.api.apos.repository.ProductoElaboradoRepository;
import com.api.apos.repository.RecetaIngredienteRepository;
import com.api.apos.repository.RecetaRepository;
import com.api.apos.repository.SucursalRepository;

/**
 * Controlador para gestionar recetas y sus ingredientes
 * Maneja recetas intermedias (que se almacenan) y finales (productos terminados)
 */
@RestController
@RequestMapping("/api/recetas")
@CrossOrigin(origins = "*")
public class RecetaController {

    @Autowired
    private RecetaRepository recetaRepository;
    
    @Autowired
    private RecetaIngredienteRepository recetaIngredienteRepository;
    
    @Autowired
    private SucursalRepository sucursalRepository;
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @Autowired
    private ProductoElaboradoRepository productoElaboradoRepository;

    /**
     * GET /api/recetas/sucursal/{sucursalId}
     * Obtiene todas las recetas de una sucursal específica
     * @param sucursalId ID de la sucursal
     * @return Lista de recetas con sus ingredientes
     */
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<RecetaDTO>>> obtenerPorSucursal(
            @PathVariable Long sucursalId) {
        List<Receta> recetas = recetaRepository.findBySucursalId(sucursalId);
        List<RecetaDTO> recetasDTO = recetas.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, recetasDTO, "Recetas obtenidas exitosamente"));
    }

    /**
     * GET /api/recetas/{id}
     * Obtiene una receta específica con todos sus detalles e ingredientes
     * @param id ID de la receta
     * @return Receta completa con lista de ingredientes
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<RecetaDTO>> obtenerPorId(@PathVariable Long id) {
        return recetaRepository.findById(id)
            .map(receta -> ResponseEntity.ok(
                new ApiResponseWrapper<>(true, convertirADTO(receta), "Receta encontrada")))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Receta no encontrada")));
    }

    /**
     * GET /api/recetas/sucursal/{sucursalId}/activas
     * Obtiene solo las recetas activas de una sucursal (disponibles para producción)
     * @param sucursalId ID de la sucursal
     * @return Lista de recetas activas
     */
    @GetMapping("/sucursal/{sucursalId}/activas")
    public ResponseEntity<ApiResponseWrapper<List<RecetaDTO>>> obtenerActivasPorSucursal(
            @PathVariable Long sucursalId) {
        List<Receta> recetas = recetaRepository.findBySucursalIdAndActivaTrue(sucursalId);
        List<RecetaDTO> recetasDTO = recetas.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, recetasDTO, "Recetas activas obtenidas"));
    }

    /**
     * POST /api/recetas
     * Crea una nueva receta (puede ser INTERMEDIA o FINAL)
     * Si es INTERMEDIA, genera un ProductoElaborado que se puede usar en otras recetas
     * @param recetaDTO Datos de la receta a crear
     * @return Receta creada con su ID
     */
    @PostMapping
    public ResponseEntity<ApiResponseWrapper<RecetaDTO>> crear(@RequestBody RecetaDTO recetaDTO) {
        try {
            Sucursal sucursal = sucursalRepository.findById(recetaDTO.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            
            Receta receta = new Receta();
            receta.setNombre(recetaDTO.getNombre());
            receta.setDescripcion(recetaDTO.getDescripcion());
            receta.setTiempoPreparacion(recetaDTO.getTiempoPreparacion());
            receta.setPorciones(recetaDTO.getPorciones());
            receta.setPrecioVenta(recetaDTO.getPrecioVenta());
            receta.setTipoReceta(Receta.TipoReceta.valueOf(recetaDTO.getTipoReceta()));
            receta.setActiva(recetaDTO.getActiva() != null ? recetaDTO.getActiva() : true);
            receta.setSucursal(sucursal);
            receta.setFechaCreacion(LocalDateTime.now());
            receta.setFechaActualizacion(LocalDateTime.now());
            
            Receta guardada = recetaRepository.save(receta);
            
            // Si es receta INTERMEDIA, crear el ProductoElaborado asociado
            if (guardada.getTipoReceta() == Receta.TipoReceta.INTERMEDIA) {
                ProductoElaborado producto = new ProductoElaborado();
                producto.setNombre(guardada.getNombre());
                producto.setDescripcion("Producto elaborado de: " + guardada.getNombre());
                producto.setRecetaOrigen(guardada);
                producto.setUnidadMedida("porciones");
                producto.setActivo(true);
                producto.setFechaCreacion(LocalDateTime.now());
                
                ProductoElaborado productoGuardado = productoElaboradoRepository.save(producto);
                guardada.setProductoElaborado(productoGuardado);
                recetaRepository.save(guardada);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseWrapper<>(true, convertirADTO(guardada), "Receta creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, null, "Error al crear receta: " + e.getMessage()));
        }
    }

    /**
     * POST /api/recetas/{recetaId}/ingredientes
     * Agrega un ingrediente a una receta existente
     * El ingrediente puede ser un Material o un ProductoElaborado (otra receta)
     * @param recetaId ID de la receta
     * @param ingredienteDTO Datos del ingrediente a agregar
     * @return Ingrediente agregado
     */
    @PostMapping("/{recetaId}/ingredientes")
    public ResponseEntity<ApiResponseWrapper<RecetaIngredienteDTO>> agregarIngrediente(
            @PathVariable Long recetaId,
            @RequestBody RecetaIngredienteDTO ingredienteDTO) {
        try {
            Receta receta = recetaRepository.findById(recetaId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
            
            RecetaIngrediente ingrediente = new RecetaIngrediente();
            ingrediente.setReceta(receta);
            ingrediente.setTipoIngrediente(
                RecetaIngrediente.TipoIngrediente.valueOf(ingredienteDTO.getTipoIngrediente()));
            ingrediente.setCantidadRequerida(new BigDecimal(ingredienteDTO.getCantidadRequerida()));
            ingrediente.setNotas(ingredienteDTO.getNotas());
            
            // Según el tipo, asignar material o producto elaborado
            if (ingrediente.getTipoIngrediente() == RecetaIngrediente.TipoIngrediente.MATERIAL) {
                Material material = materialRepository.findById(ingredienteDTO.getMaterialId())
                    .orElseThrow(() -> new RuntimeException("Material no encontrado"));
                ingrediente.setMaterial(material);
            } else {
                ProductoElaborado producto = productoElaboradoRepository.findById(ingredienteDTO.getProductoElaboradoId())
                    .orElseThrow(() -> new RuntimeException("Producto elaborado no encontrado"));
                ingrediente.setProductoElaborado(producto);
            }
            
            RecetaIngrediente guardado = recetaIngredienteRepository.save(ingrediente);
            
            // Actualizar fecha de actualización de la receta
            receta.setFechaActualizacion(LocalDateTime.now());
            recetaRepository.save(receta);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseWrapper<>(true, convertirIngredienteADTO(guardado), 
                    "Ingrediente agregado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, null, "Error: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/recetas/ingredientes/{ingredienteId}
     * Elimina un ingrediente de una receta
     * @param ingredienteId ID del ingrediente a eliminar
     * @return Confirmación de eliminación
     */
    @DeleteMapping("/ingredientes/{ingredienteId}")
    public ResponseEntity<ApiResponseWrapper<String>> eliminarIngrediente(
            @PathVariable Long ingredienteId) {
        return recetaIngredienteRepository.findById(ingredienteId)
            .map(ingrediente -> {
                recetaIngredienteRepository.delete(ingrediente);
                return ResponseEntity.ok(
                    new ApiResponseWrapper<>(true, "Eliminado", "Ingrediente eliminado exitosamente"));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Ingrediente no encontrado")));
    }

    /**
     * PUT /api/recetas/{id}/activar
     * Activa o desactiva una receta
     * @param id ID de la receta
     * @param activa true para activar, false para desactivar
     * @return Receta actualizada
     */
    @PutMapping("/{id}/activar")
    public ResponseEntity<ApiResponseWrapper<RecetaDTO>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean activa) {
        return recetaRepository.findById(id)
            .map(receta -> {
                receta.setActiva(activa);
                receta.setFechaActualizacion(LocalDateTime.now());
                Receta actualizada = recetaRepository.save(receta);
                return ResponseEntity.ok(
                    new ApiResponseWrapper<>(true, convertirADTO(actualizada), 
                        "Estado de receta actualizado"));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Receta no encontrada")));
    }

    /**
     * Convierte Receta a DTO con sus ingredientes
     */
    private RecetaDTO convertirADTO(Receta receta) {
        List<RecetaIngredienteDTO> ingredientesDTO = receta.getIngredientes() != null ?
            receta.getIngredientes().stream()
                .map(this::convertirIngredienteADTO)
                .collect(Collectors.toList()) : null;
        
        return new RecetaDTO(
            receta.getId(),
            receta.getNombre(),
            receta.getDescripcion(),
            receta.getTiempoPreparacion(),
            receta.getPorciones(),
            receta.getPrecioVenta(),
            receta.getTipoReceta() != null ? receta.getTipoReceta().name() : null,
            receta.getActiva(),
            receta.getSucursal() != null ? receta.getSucursal().getId() : null,
            receta.getSucursal() != null ? receta.getSucursal().getNombre() : null,
            receta.getFechaCreacion(),
            ingredientesDTO,
            receta.getProductoElaborado() != null ? receta.getProductoElaborado().getNombre() : null
        );
    }

    /**
     * Convierte RecetaIngrediente a DTO
     */
    private RecetaIngredienteDTO convertirIngredienteADTO(RecetaIngrediente ingrediente) {
        String unidad = null;
        String materialNombre = null;
        Long materialId = null;
        String productoNombre = null;
        Long productoId = null;
        
        if (ingrediente.getTipoIngrediente() == RecetaIngrediente.TipoIngrediente.MATERIAL) {
            materialId = ingrediente.getMaterial().getId();
            materialNombre = ingrediente.getMaterial().getNombre();
            unidad = ingrediente.getMaterial().getTipoUnidad() != null ? 
                     ingrediente.getMaterial().getTipoUnidad().name() : null;
        } else {
            productoId = ingrediente.getProductoElaborado().getId();
            productoNombre = ingrediente.getProductoElaborado().getNombre();
            unidad = ingrediente.getProductoElaborado().getUnidadMedida();
        }
        
        return new RecetaIngredienteDTO(
            ingrediente.getId(),
            ingrediente.getTipoIngrediente() != null ? ingrediente.getTipoIngrediente().name() : null,
            materialId,
            materialNombre,
            productoId,
            productoNombre,
            ingrediente.getCantidadRequerida() != null ? ingrediente.getCantidadRequerida().toString() : null,
            unidad,
            ingrediente.getNotas()
        );
    }
}

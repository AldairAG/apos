package com.api.apos.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.api.apos.dto.ElaborarRecetaRequest;
import com.api.apos.dto.ProduccionRecetaDTO;
import com.api.apos.entity.ProduccionReceta;
import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Usuario;
import com.api.apos.helpers.ApiResponseWrapper;
import com.api.apos.repository.ProduccionRecetaRepository;
import com.api.apos.repository.SucursalRepository;
import com.api.apos.repository.UsuarioRepository;
import com.api.apos.service.receta.ProduccionRecetaService;

/**
 * Controlador para elaborar recetas y registrar producciones
 * Maneja el proceso de producción que automáticamente:
 * - Verifica inventario disponible
 * - Reduce materiales y productos elaborados del inventario
 * - Agrega productos elaborados si la receta es INTERMEDIA
 * - Registra la producción para trazabilidad
 */
@RestController
@RequestMapping("/api/produccion")
@CrossOrigin(origins = "*")
public class ProduccionRecetaController {

    @Autowired
    private ProduccionRecetaService produccionRecetaService;
    
    @Autowired
    private ProduccionRecetaRepository produccionRecetaRepository;
    
    @Autowired
    private SucursalRepository sucursalRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * POST /api/produccion/elaborar
     * Elabora una receta completa (verifica inventario y reduce automáticamente)
     * 
     * PROCESO:
     * 1. Verifica que hay suficiente inventario de todos los ingredientes
     * 2. Reduce las cantidades necesarias del inventario
     * 3. Si es receta INTERMEDIA, agrega el producto al inventario
     * 4. Registra la producción para trazabilidad
     * 
     * @param request Datos de la elaboración (receta, sucursal, cantidad)
     * @param authentication Usuario autenticado que elabora
     * @return Registro de producción creado
     */
    @PostMapping("/elaborar")
    public ResponseEntity<ApiResponseWrapper<ProduccionRecetaDTO>> elaborarReceta(
            @RequestBody ElaborarRecetaRequest request,
            Authentication authentication) {
        try {
            // Obtener datos necesarios
            Sucursal sucursal = sucursalRepository.findById(request.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            
            Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Elaborar la receta (hace todo el proceso automáticamente)
            ProduccionReceta produccion = produccionRecetaService.elaborarReceta(
                request.getRecetaId(),
                sucursal,
                usuario,
                request.getCantidad()
            );
            
            // Agregar observaciones si existen
            if (request.getObservaciones() != null) {
                produccion.setObservaciones(request.getObservaciones());
                produccionRecetaRepository.save(produccion);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseWrapper<>(true, convertirADTO(produccion), 
                    "Receta elaborada exitosamente. Inventario actualizado."));
                    
        } catch (RuntimeException e) {
            // Capturar errores de inventario insuficiente o receta no encontrada
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponseWrapper<>(false, null, "Error al elaborar receta: " + e.getMessage()));
        }
    }

    /**
     * GET /api/produccion/verificar-inventario
     * Verifica si hay suficiente inventario para elaborar una receta
     * Útil para mostrar al usuario ANTES de intentar producir
     * 
     * @param recetaId ID de la receta
     * @param sucursalId ID de la sucursal
     * @param cantidad Cantidad de porciones a producir
     * @return true si hay inventario suficiente, false si no
     */
    @GetMapping("/verificar-inventario")
    public ResponseEntity<ApiResponseWrapper<Boolean>> verificarInventario(
            @RequestParam Long recetaId,
            @RequestParam Long sucursalId,
            @RequestParam Integer cantidad) {
        try {
            Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            
            boolean disponible = produccionRecetaService.verificarInventarioDisponible(
                recetaId, sucursal, cantidad);
            
            String mensaje = disponible ? 
                "Inventario suficiente para producir" : 
                "Inventario insuficiente. Verifique materiales y productos elaborados necesarios.";
            
            return ResponseEntity.ok(new ApiResponseWrapper<>(disponible, disponible, mensaje));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, false, "Error: " + e.getMessage()));
        }
    }

    /**
     * GET /api/produccion/sucursal/{sucursalId}
     * Obtiene el historial de producciones de una sucursal
     * Útil para reportes y trazabilidad
     * 
     * @param sucursalId ID de la sucursal
     * @return Lista de todas las producciones registradas
     */
    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<ProduccionRecetaDTO>>> obtenerProduccionesPorSucursal(
            @PathVariable Long sucursalId) {
        List<ProduccionReceta> producciones = produccionRecetaRepository.findBySucursalId(sucursalId);
        List<ProduccionRecetaDTO> produccionesDTO = producciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, produccionesDTO, "Historial de producciones obtenido"));
    }

    /**
     * GET /api/produccion/receta/{recetaId}
     * Obtiene el historial de producciones de una receta específica
     * Útil para análisis de producción por producto
     * 
     * @param recetaId ID de la receta
     * @return Lista de producciones de esa receta
     */
    @GetMapping("/receta/{recetaId}")
    public ResponseEntity<ApiResponseWrapper<List<ProduccionRecetaDTO>>> obtenerProduccionesPorReceta(
            @PathVariable Long recetaId) {
        List<ProduccionReceta> producciones = produccionRecetaRepository.findByRecetaId(recetaId);
        List<ProduccionRecetaDTO> produccionesDTO = producciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, produccionesDTO, "Producciones de la receta obtenidas"));
    }

    /**
     * GET /api/produccion/usuario/{usuarioId}
     * Obtiene las producciones realizadas por un usuario específico
     * Útil para reportes de desempeño
     * 
     * @param usuarioId ID del usuario
     * @return Lista de producciones del usuario
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseWrapper<List<ProduccionRecetaDTO>>> obtenerProduccionesPorUsuario(
            @PathVariable Long usuarioId) {
        List<ProduccionReceta> producciones = produccionRecetaRepository.findByUsuarioId(usuarioId);
        List<ProduccionRecetaDTO> produccionesDTO = producciones.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            new ApiResponseWrapper<>(true, produccionesDTO, "Producciones del usuario obtenidas"));
    }

    /**
     * GET /api/produccion/fecha
     * Obtiene producciones en un rango de fechas
     * Útil para reportes periódicos (diario, semanal, mensual)
     * 
     * @param inicio Fecha de inicio (formato: yyyy-MM-ddTHH:mm:ss)
     * @param fin Fecha de fin
     * @return Lista de producciones en el rango
     */
    @GetMapping("/fecha")
    public ResponseEntity<ApiResponseWrapper<List<ProduccionRecetaDTO>>> obtenerProduccionesPorFecha(
            @RequestParam String inicio,
            @RequestParam String fin) {
        try {
            LocalDateTime fechaInicio = LocalDateTime.parse(inicio);
            LocalDateTime fechaFin = LocalDateTime.parse(fin);
            
            List<ProduccionReceta> producciones = produccionRecetaRepository
                .findByFechaProduccionBetween(fechaInicio, fechaFin);
            List<ProduccionRecetaDTO> produccionesDTO = producciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(
                new ApiResponseWrapper<>(true, produccionesDTO, 
                    "Producciones en el rango obtenidas"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseWrapper<>(false, null, "Error en formato de fechas: " + e.getMessage()));
        }
    }

    /**
     * GET /api/produccion/{id}
     * Obtiene el detalle de una producción específica
     * 
     * @param id ID de la producción
     * @return Detalle completo de la producción
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<ProduccionRecetaDTO>> obtenerPorId(@PathVariable Long id) {
        return produccionRecetaRepository.findById(id)
            .map(produccion -> ResponseEntity.ok(
                new ApiResponseWrapper<>(true, convertirADTO(produccion), "Producción encontrada")))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponseWrapper<>(false, null, "Producción no encontrada")));
    }

    /**
     * Convierte ProduccionReceta a DTO
     */
    private ProduccionRecetaDTO convertirADTO(ProduccionReceta produccion) {
        return new ProduccionRecetaDTO(
            produccion.getId(),
            produccion.getReceta().getId(),
            produccion.getReceta().getNombre(),
            produccion.getReceta().getTipoReceta() != null ? 
                produccion.getReceta().getTipoReceta().name() : null,
            produccion.getSucursal().getId(),
            produccion.getSucursal().getNombre(),
            produccion.getUsuario().getId(),
            produccion.getUsuario().getEmail(),
            produccion.getCantidad(),
            produccion.getFechaProduccion(),
            produccion.getObservaciones()
        );
    }
}

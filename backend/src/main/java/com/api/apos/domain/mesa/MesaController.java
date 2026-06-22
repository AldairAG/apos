package com.api.apos.domain.mesa;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.api.apos.domain.mesa.dto.CrearMesaDTO;
import com.api.apos.domain.mesa.service.MesaService;
import com.api.apos.enums.EstadoMesa;
import com.api.apos.helpers.ApiResponseWrapper;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;




@Controller
@RequestMapping("/api/mesas")
public class MesaController {
    
    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    /**
     * Agregar una mesa a una sucursal
     * POST /api/mesas?sucursalId={sucursalId}
     */
    @PostMapping("/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<Mesa>> agregarMesa(@RequestBody CrearMesaDTO crearMesaDTO, @RequestParam Long sucursalId) {
        try {
            Mesa nuevaMesa = mesaService.crearMesa(crearMesaDTO, sucursalId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseWrapper<>(true, nuevaMesa, "Mesa agregada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PostMapping("/cambiar-estado/{id}/estado/{nuevoEstado}")
    public ResponseEntity<ApiResponseWrapper<Mesa>> cambiarEstadoMesa(@PathVariable Long id, @PathVariable EstadoMesa nuevoEstado) {
        try {
            Mesa mesaActualizada = mesaService.cambiarEstadoMesa(id, nuevoEstado);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesaActualizada, "Estado de la mesa actualizado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<ApiResponseWrapper<List<Mesa>>> obtenerMesasPorSucursal(@PathVariable Long sucursalId) {
        try {
            List<Mesa> mesas = mesaService.obtenerMesasPorSucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesas, "Mesas obtenidas exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Mesa>> actualizarMesa(@PathVariable Long id, @RequestBody Mesa entity) {
        try {
            Mesa mesaActualizada = mesaService.actualizarMesa(id, entity);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesaActualizada, "Mesa actualizada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Void>> eliminarMesa(@PathVariable Long id) {
        try {
            mesaService.eliminarMesa(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, null, "Mesa eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseWrapper<Mesa>> obtenerMesa(@PathVariable Long id) {
        try {
            Mesa mesa = mesaService.obtenerMesaPorId(id);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, mesa, "Mesa obtenida exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
    

}

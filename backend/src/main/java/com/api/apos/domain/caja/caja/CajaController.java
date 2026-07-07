package com.api.apos.domain.caja.caja;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.dto.CrearCajaRequest;
import com.api.apos.domain.caja.caja.service.CajaService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@AllArgsConstructor
@RequestMapping("/api/cajas")
public class CajaController {
    private final CajaService cajaService;

    @PostMapping
    public ResponseEntity<ApiResponseWrapper<CajaDTO>> CrearCaja(@RequestBody CrearCajaRequest entity) {
        try {
            CajaDTO nuevaCaja = cajaService.crearCaja(entity);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, nuevaCaja, "Caja creada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/getBySucursal/{idSucursal}")
    public ResponseEntity<ApiResponseWrapper<List<CajaDTO>>> obtenerCajasPorSucursal(@PathVariable Long idSucursal) {
        try {
            List<CajaDTO> cajas = cajaService.obtenerCajasPorSucursal(idSucursal);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajas, "Cajas obtenidas exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
}

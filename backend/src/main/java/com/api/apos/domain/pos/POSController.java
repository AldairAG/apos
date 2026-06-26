package com.api.apos.domain.pos;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.pos.dto.CrearOrdenDTO;
import com.api.apos.domain.pos.dto.OrdenResponseDTO;
import com.api.apos.domain.pos.dto.ProductosBySucursalResponse;
import com.api.apos.domain.pos.service.POSService;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class POSController {

    private final POSService posService;

    @PostMapping("/crear-orden")
    public ResponseEntity<ApiResponseWrapper<OrdenResponseDTO>> crearOrden(@RequestBody CrearOrdenDTO crearOrdenDTO) {
        try {
            OrdenResponseDTO ordenResponseDTO = posService.crearOrden(crearOrdenDTO);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenResponseDTO, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("orden/sucursal/{id}")
    public ResponseEntity<ApiResponseWrapper<List<OrdenResponseDTO>>> getOrdenesBySucursal(@RequestParam Long sucursalId) {
        try {
            List<OrdenResponseDTO> ordenes = posService.obtenerOrdenesPorSucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, ordenes, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/productos/sucursal/{id}")
    public ResponseEntity<ApiResponseWrapper<List<ProductosBySucursalResponse>>> getProductosBySucursal(@RequestParam Long sucursalId) {
        try {
            List<ProductosBySucursalResponse> productos = posService.obtnerProdcutosBySucursal(sucursalId);
            return ResponseEntity.ok(new ApiResponseWrapper<>(true, productos, null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
        }
    }
    
    

}

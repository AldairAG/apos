package com.api.apos.aplication.caja;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.caja.dto.CajaDto;
import com.api.apos.aplication.caja.query.FindCajaBySucursalId;
import com.api.apos.aplication.caja.usecase.AbrirCajaUseCase;
import com.api.apos.aplication.caja.usecase.CerrarCajaUseCase;
import com.api.apos.aplication.caja.usecase.CrearCajaUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping("/api/cajas")
@AllArgsConstructor 
public class CajaController {

    private final FindCajaBySucursalId findCajaBySucursalId;

    private final CerrarCajaUseCase cerrarCajaUseCase;

    private final AbrirCajaUseCase abrirCajaUseCase;

    private final CrearCajaUseCase crearCajaUseCase;
    

    @GetMapping("/{cajaId}/abrir")
    public ResponseEntity<ApiResponseWrapper<CajaDto>> abrirCaja(@PathVariable String cajaId) {
        CajaDto cajaAbierta=abrirCajaUseCase.execute(Long.parseLong(cajaId));
        return ResponseEntity.ok(ApiResponseWrapper.success(cajaAbierta));
    }

    @GetMapping("/{cajaId}/cerrar")
    public ResponseEntity<ApiResponseWrapper<CajaDto>> cerrarCaja(@PathVariable String cajaId) {
        CajaDto closedCaja = cerrarCajaUseCase.execute(Long.parseLong(cajaId));
        return ResponseEntity.ok(ApiResponseWrapper.success(closedCaja));
    }

    @GetMapping("/sucursal/{cajaId}")
    public ResponseEntity<ApiResponseWrapper<List<CajaDto>>> findCajaBySucursalId(@PathVariable String cajaId) {
        List<CajaDto> cajas = findCajaBySucursalId.execute(Long.parseLong(cajaId));
        return ResponseEntity.ok(new ApiResponseWrapper<>(true, cajas, null, null));
    }

    @PostMapping("/")
    public ResponseEntity<ApiResponseWrapper<CajaDto>> crearCaja(@RequestBody CajaDto cajaDto) {
        CajaDto createdCaja = crearCajaUseCase.execute(cajaDto);
        return ResponseEntity.ok(ApiResponseWrapper.success(createdCaja));
    }
    
    

}
